from datetime import datetime, timedelta, timezone
from sqlalchemy import text
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app.core.config import settings


def create_otp(db: Session, user_id: int, code: str, purpose: str = "email_verify") -> None:
    """Insert a new OTP, invalidating any previous unused ones for this user and purpose."""
    try:
        # Determine expiry based on purpose
        exp_minutes = settings.password_reset_expire_minutes if purpose == "password_reset" else settings.otp_expire_minutes
        
        # Invalidate old OTPs for this user and purpose
        db.execute(
            text("UPDATE otp_codes SET used = TRUE WHERE user_id = :uid AND used = FALSE AND purpose = :purpose"),
            {"uid": user_id, "purpose": purpose}
        )
        db.execute(
            text("""INSERT INTO otp_codes (user_id, code, purpose, expires_at)
                    VALUES (:uid, :code, :purpose, NOW() + INTERVAL :exp MINUTE)"""),
            {"uid": user_id, "code": code, "purpose": purpose, "exp": exp_minutes}
        )
        db.commit()
    except SQLAlchemyError as e:
        db.rollback()
        raise ValueError("Database error while creating OTP") from e


def verify_otp(db: Session, user_id: int, code: str, purpose: str = "email_verify") -> bool:
    """
    Check if the OTP is valid (correct, not expired, not used).
    If valid and purpose is email_verify: marks OTP as used AND sets user.is_verified = True.
    If valid and purpose is password_reset: just marks OTP as used.
    """
    try:
        row = db.execute(
            text("""SELECT id FROM otp_codes
                    WHERE user_id = :uid AND code = :code AND purpose = :purpose
                      AND used = FALSE AND expires_at > NOW()
                    ORDER BY created_at DESC LIMIT 1"""),
            {"uid": user_id, "code": code, "purpose": purpose}
        ).mappings().first()

        if not row:
            return False

        # Mark OTP as used
        db.execute(text("UPDATE otp_codes SET used = TRUE WHERE id = :id"), {"id": row["id"]})
        
        # Only verify user email if the purpose is email verification
        if purpose == "email_verify":
            db.execute(text("UPDATE users SET is_verified = TRUE WHERE id = :uid"), {"uid": user_id})
        
        db.commit()
        return True
    except SQLAlchemyError as e:
        db.rollback()
        raise ValueError("Database error while verifying OTP") from e


def get_seconds_since_last_otp(db: Session, user_id: int) -> int | None:
    """Return seconds elapsed since the most recent OTP was created."""
    try:
        row = db.execute(
            text("SELECT TIMESTAMPDIFF(SECOND, created_at, NOW()) AS elapsed "
                 "FROM otp_codes WHERE user_id = :uid ORDER BY created_at DESC LIMIT 1"),
            {"uid": user_id}
        ).mappings().first()
        return row["elapsed"] if row else None
    except SQLAlchemyError as e:
        raise ValueError("Database error while checking OTP rate limit") from e


def cleanup_expired_otps(db: Session) -> int:
    """
    Delete all used or expired OTPs older than 24 hours.
    Returns the number of rows deleted. Called monthly by background task.
    """
    try:
        result = db.execute(
            text("DELETE FROM otp_codes WHERE used = TRUE OR expires_at < NOW() - INTERVAL 1 DAY")
        )
        db.commit()
        return result.rowcount
    except SQLAlchemyError as e:
        db.rollback()
        raise ValueError("Database error during OTP cleanup") from e
