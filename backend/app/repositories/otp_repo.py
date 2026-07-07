from datetime import datetime, timedelta, timezone
from sqlalchemy import text
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app.core.config import settings


def _utcnow() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def create_otp(db: Session, user_id: int, code: str, purpose: str = "email_verify") -> None:
    """Insert a new OTP, invalidating any previous unused ones for this user and purpose."""
    try:
        exp_minutes = settings.password_reset_expire_minutes if purpose == "password_reset" else settings.otp_expire_minutes
        expires_at = _utcnow() + timedelta(minutes=exp_minutes)

        db.execute(
            text("UPDATE otp_codes SET used = 1 WHERE user_id = :uid AND used = 0 AND purpose = :purpose"),
            {"uid": user_id, "purpose": purpose}
        )
        db.execute(
            text("""INSERT INTO otp_codes (user_id, code, purpose, expires_at)
                    VALUES (:uid, :code, :purpose, :expires_at)"""),
            {"uid": user_id, "code": code, "purpose": purpose, "expires_at": expires_at}
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
        now = _utcnow()
        row = db.execute(
            text("""SELECT id FROM otp_codes
                    WHERE user_id = :uid AND code = :code AND purpose = :purpose
                      AND used = 0 AND expires_at > :now
                    ORDER BY created_at DESC LIMIT 1"""),
            {"uid": user_id, "code": code, "purpose": purpose, "now": now}
        ).mappings().first()

        if not row:
            return False

        db.execute(text("UPDATE otp_codes SET used = 1 WHERE id = :id"), {"id": row["id"]})

        if purpose == "email_verify":
            db.execute(text("UPDATE users SET is_verified = 1 WHERE id = :uid"), {"uid": user_id})

        db.commit()
        return True
    except SQLAlchemyError as e:
        db.rollback()
        raise ValueError("Database error while verifying OTP") from e


def get_seconds_since_last_otp(db: Session, user_id: int) -> int | None:
    """Return seconds elapsed since the most recent OTP was created."""
    try:
        row = db.execute(
            text("SELECT created_at FROM otp_codes WHERE user_id = :uid ORDER BY created_at DESC LIMIT 1"),
            {"uid": user_id}
        ).mappings().first()
        if not row or row["created_at"] is None:
            return None
        created_at = row["created_at"]
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at)
        elapsed = (_utcnow() - created_at).total_seconds()
        return int(elapsed)
    except SQLAlchemyError as e:
        raise ValueError("Database error while checking OTP rate limit") from e


def cleanup_expired_otps(db: Session) -> int:
    """
    Delete all used or expired OTPs older than 24 hours.
    Returns the number of rows deleted. Called monthly by background task.
    """
    try:
        cutoff = _utcnow() - timedelta(days=1)
        result = db.execute(
            text("DELETE FROM otp_codes WHERE used = 1 OR expires_at < :cutoff"),
            {"cutoff": cutoff}
        )
        db.commit()
        return result.rowcount
    except SQLAlchemyError as e:
        db.rollback()
        raise ValueError("Database error during OTP cleanup") from e
