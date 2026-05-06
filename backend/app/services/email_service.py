import smtplib
import random
import string
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

logger = logging.getLogger(__name__)


def generate_otp() -> str:
    """Generate a 6-digit numeric OTP."""
    return ''.join(random.choices(string.digits, k=6))


def send_otp_email(to_email: str, otp: str) -> bool:
    """
    Send a verification OTP via SMTP (Gmail App Password).
    Returns True on success, False on failure (non-blocking).
    """
    if not settings.smtp_user or not settings.smtp_password:
        logger.warning("SMTP credentials not configured — skipping OTP email to %s", to_email)
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"BusLens — Your verification code is {otp}"
    msg["From"] = settings.smtp_user
    msg["To"] = to_email

    html = f"""
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: auto;
                padding: 32px; background: #fafafa; border-radius: 12px;">
      <h2 style="margin: 0 0 8px 0; color: #1a1a2e;">Verify your email</h2>
      <p style="color: #555; margin: 0 0 24px 0;">
        Use the code below to verify your BusLens account.
      </p>
      <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px;
                  padding: 16px 24px; background: #ffffff; border: 2px solid #e0e0e0;
                  border-radius: 8px; text-align: center; color: #1a1a2e;">
        {otp}
      </div>
      <p style="color: #999; margin-top: 20px; font-size: 13px;">
        This code expires in {settings.otp_expire_minutes} minutes.
        If you didn't request this, ignore this email.
      </p>
    </div>
    """
    msg.attach(MIMEText(html, "html"))

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10) as server:
            server.starttls()
            server.login(settings.smtp_user, settings.smtp_password)
            server.sendmail(settings.smtp_user, to_email, msg.as_string())
        logger.info("OTP email sent to %s", to_email)
        return True
    except Exception as e:
        logger.error("Failed to send OTP email to %s: %s", to_email, e)
        return False
