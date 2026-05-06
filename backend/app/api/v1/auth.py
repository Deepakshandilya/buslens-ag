from datetime import timedelta, datetime, timezone
from urllib.parse import urlencode
import logging

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from sqlalchemy import text
import httpx

from app.db.session import get_db
from app.core.security import verify_password, create_access_token
from app.core.config import settings
from app.schemas.user import UserCreate, UserResponse, Token, OTPRequest, OTPResponse, ForgotPasswordRequest, ResetPasswordRequest
from app.repositories.users_repo import (
    get_user_by_email,
    create_user,
    get_user_by_google_id,
    create_google_user,
    link_google_to_user,
    update_user_password,
)
from app.repositories.otp_repo import create_otp, verify_otp, get_seconds_since_last_otp
from app.services.email_service import generate_otp, send_otp_email, send_welcome_email, send_password_reset_email
from app.api.deps import get_current_user
from app.core.security import verify_password, create_access_token, get_password_hash

logger = logging.getLogger(__name__)

router = APIRouter()


# ── Register (instant login + sends OTP) ──────────────────────────────
@router.post("/register", response_model=Token)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    user = get_user_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    user = create_user(db, user_in)

    # Generate and send OTP (non-blocking — if email fails, user is still registered)
    otp = generate_otp()
    create_otp(db, user["id"], otp)
    send_welcome_email(user_in.email)
    send_otp_email(user_in.email, otp)

    # Instant login: return JWT immediately
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


# ── Login ──────────────────────────────────────────────────────────────
@router.post("/login", response_model=Token)
def login_access_token(
    db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
):
    user = get_user_by_email(db, email=form_data.username)
    if not user or not user.get("hashed_password"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


# ── Verify Email (submit OTP) ─────────────────────────────────────────
@router.post("/verify-email", response_model=OTPResponse)
def verify_email(
    body: OTPRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    if current_user.get("is_verified"):
        return {"message": "Email already verified"}

    if verify_otp(db, current_user["id"], body.otp):
        return {"message": "Email verified successfully"}

    raise HTTPException(
        status_code=400,
        detail="Invalid or expired OTP. Please request a new one.",
    )


# ── Resend OTP (rate-limited: 1 per 60 seconds) ──────────────────────
@router.post("/resend-otp", response_model=OTPResponse)
def resend_otp(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    if current_user.get("is_verified"):
        return {"message": "Email already verified"}

    # Rate limit: check last OTP was sent more than 60 seconds ago
    elapsed = get_seconds_since_last_otp(db, current_user["id"])
    if elapsed is not None and elapsed < 60:
        remaining = int(60 - elapsed)
        # Prevent negative remaining if there's clock skew or edge case
        if remaining > 0:
            raise HTTPException(
                status_code=429,
                detail=f"Please wait {remaining} seconds before requesting a new OTP.",
            )

    otp = generate_otp()
    create_otp(db, current_user["id"], otp)
    send_otp_email(current_user["email"], otp)

    return {"message": "Verification code sent to your email"}


# ── Google OAuth: redirect to consent screen ──────────────────────────
@router.get("/google/login")
def google_login():
    if not settings.google_client_id:
        raise HTTPException(status_code=501, detail="Google OAuth not configured")

    params = urlencode({
        "client_id": settings.google_client_id,
        "redirect_uri": settings.google_redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent",
    })
    return RedirectResponse(f"https://accounts.google.com/o/oauth2/v2/auth?{params}")


# ── Google OAuth: callback ────────────────────────────────────────────
@router.get("/google/callback")
def google_callback(
    code: str | None = None, 
    error: str | None = None, 
    db: Session = Depends(get_db)
):
    if error or not code:
        logger.warning(f"Google OAuth failed or was canceled. Error: {error}")
        return RedirectResponse(f"{settings.frontend_url}/login?error=access_denied")

    # 1. Exchange authorization code for tokens
    token_resp = httpx.post(
        "https://oauth2.googleapis.com/token",
        data={
            "code": code,
            "client_id": settings.google_client_id,
            "client_secret": settings.google_client_secret,
            "redirect_uri": settings.google_redirect_uri,
            "grant_type": "authorization_code",
        },
        timeout=10,
    )
    if token_resp.status_code != 200:
        logger.error("Google token exchange failed: %s", token_resp.text)
        return RedirectResponse(f"{settings.frontend_url}/login?error=google_auth_failed")

    tokens = token_resp.json()

    # 2. Get user info from Google
    userinfo_resp = httpx.get(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        headers={"Authorization": f"Bearer {tokens['access_token']}"},
        timeout=10,
    )
    if userinfo_resp.status_code != 200:
        return RedirectResponse(f"{settings.frontend_url}/login?error=google_auth_failed")

    userinfo = userinfo_resp.json()
    email = userinfo.get("email")
    google_id = userinfo.get("sub")

    if not email or not google_id:
        return RedirectResponse(f"{settings.frontend_url}/login?error=google_auth_failed")

    # 3. Find or create user
    user = get_user_by_google_id(db, google_id)
    if not user:
        # Check if email already exists (registered with password)
        user = get_user_by_email(db, email)
        if user:
            # Link Google account to existing user
            link_google_to_user(db, user["id"], google_id)
            user = get_user_by_email(db, email)
        else:
            # Brand new user via Google
            user = create_google_user(db, email, google_id)
            send_welcome_email(email)

    # 4. Issue our JWT and redirect to frontend callback page
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    return RedirectResponse(f"{settings.frontend_url}/auth/callback?token={access_token}")


# ── Validate Token ────────────────────────────────────────────────────
@router.get("/validate-token")
def validate_token(current_user: dict = Depends(get_current_user)):
    """
    Lightweight endpoint to validate the current JWT.
    Returns 200 if valid, 401 if expired/invalid (handled by get_current_user).
    """
    return {"valid": True, "email": current_user["email"]}

# ── Forgot Password (send OTP to email) ───────────────────────────────
@router.post("/forgot-password", response_model=OTPResponse)
def forgot_password(body: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Send a password reset OTP to the user's email.
    Always returns success message (even if email not found) to prevent email enumeration.
    """
    user = get_user_by_email(db, email=body.email)
    if user:
        # Only allow for local auth users who have a password
        if user.get("auth_provider") == "google" and not user.get("hashed_password"):
            # Google-only users can't reset password — but don't leak this info
            return {"message": "If an account exists with this email, a reset code has been sent."}

        # Rate limit: check last OTP was sent more than 60 seconds ago
        elapsed = get_seconds_since_last_otp(db, user["id"])
        if elapsed is not None and elapsed < 60:
            remaining = int(60 - elapsed)
            if remaining > 0:
                raise HTTPException(
                    status_code=429,
                    detail=f"Please wait {remaining} seconds before requesting a new code.",
                )

        otp = generate_otp()
        create_otp(db, user["id"], otp, purpose="password_reset")
        send_password_reset_email(body.email, otp)

    # Always return the same message to prevent email enumeration
    return {"message": "If an account exists with this email, a reset code has been sent."}


# ── Reset Password (verify OTP + set new password) ────────────────────
@router.post("/reset-password", response_model=OTPResponse)
def reset_password(body: ResetPasswordRequest, db: Session = Depends(get_db)):
    """
    Verify the password reset OTP and set a new password.
    """
    user = get_user_by_email(db, email=body.email)
    if not user:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired reset code.",
        )

    if not verify_otp(db, user["id"], body.otp, purpose="password_reset"):
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired reset code. Please request a new one.",
        )

    new_hash = get_password_hash(body.new_password)
    update_user_password(db, user["id"], new_hash)

    return {"message": "Password reset successfully. You can now log in with your new password."}
