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
from app.schemas.user import UserCreate, UserResponse, Token, OTPRequest, OTPResponse
from app.repositories.users_repo import (
    get_user_by_email,
    create_user,
    get_user_by_google_id,
    create_google_user,
    link_google_to_user,
)
from app.repositories.otp_repo import create_otp, verify_otp, get_seconds_since_last_otp
from app.services.email_service import generate_otp, send_otp_email
from app.api.deps import get_current_user

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
def google_callback(code: str, db: Session = Depends(get_db)):
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

    # 4. Issue our JWT and redirect to frontend callback page
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    return RedirectResponse(f"{settings.frontend_url}/auth/callback?token={access_token}")
