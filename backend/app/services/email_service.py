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
    <div style="font-family: 'Inter', 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: auto;
                padding: 32px; background: #ffffff; border-radius: 16px; border: 1px solid #eaeaea;
                box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #6d28d9; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">BusLens</h1>
        <div style="width: 40px; height: 4px; background: #8b5cf6; margin: 8px auto 0; border-radius: 2px;"></div>
      </div>
      <h2 style="margin: 0 0 12px 0; color: #1e293b; font-size: 20px;">Verify your email</h2>
      <p style="color: #64748b; margin: 0 0 24px 0; font-size: 15px; line-height: 1.5;">
        You're almost there! Use the code below to verify your BusLens account.
      </p>
      <div style="font-size: 36px; font-weight: 700; letter-spacing: 12px;
                  padding: 20px 24px; background: #f8fafc; border: 2px dashed #cbd5e1;
                  border-radius: 12px; text-align: center; color: #0f172a; margin-bottom: 24px;">
        {otp}
      </div>
      <div style="border-top: 1px solid #f1f5f9; padding-top: 20px;">
        <p style="color: #94a3b8; margin: 0; font-size: 13px;">
          This code expires in {settings.otp_expire_minutes} minutes.<br>
          If you didn't request this code, you can safely ignore this email.
        </p>
      </div>
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


def send_welcome_email(to_email: str) -> bool:
    """
    Send a welcome email to a new user.
    """
    if not settings.smtp_user or not settings.smtp_password:
        logger.warning("SMTP credentials not configured — skipping welcome email to %s", to_email)
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Welcome to BusLens! 🎉"
    msg["From"] = settings.smtp_user
    msg["To"] = to_email

    html = f"""
    <div style="font-family: 'Inter', 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: auto;
                padding: 32px; background: #ffffff; border-radius: 16px; border: 1px solid #eaeaea;
                box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #6d28d9; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">BusLens</h1>
        <div style="width: 40px; height: 4px; background: #8b5cf6; margin: 8px auto 0; border-radius: 2px;"></div>
      </div>
      <h2 style="margin: 0 0 16px 0; color: #1e293b; font-size: 22px;">Welcome aboard! 🚀</h2>
      <p style="color: #475569; margin: 0 0 16px 0; font-size: 16px; line-height: 1.6;">
        We're thrilled to have you join BusLens. Our mission is to make your daily commute smarter, smoother, and more predictable.
      </p>
      <p style="color: #475569; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">
        With BusLens, you can easily track routes, save your favorite stops, and review your search history.
      </p>
      <div style="text-align: center; margin-bottom: 24px;">
        <a href="{settings.frontend_url}" 
           style="display: inline-block; padding: 12px 24px; background: #6d28d9; color: #ffffff;
                  text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px;">
          Go to Dashboard
        </a>
      </div>
      <div style="border-top: 1px solid #f1f5f9; padding-top: 20px;">
        <p style="color: #94a3b8; margin: 0; font-size: 13px; text-align: center;">
          Happy commuting,<br>The BusLens Team
        </p>
      </div>
    </div>
    """
    msg.attach(MIMEText(html, "html"))

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10) as server:
            server.starttls()
            server.login(settings.smtp_user, settings.smtp_password)
            server.sendmail(settings.smtp_user, to_email, msg.as_string())
        logger.info("Welcome email sent to %s", to_email)
        return True
    except Exception as e:
        logger.error("Failed to send welcome email to %s: %s", to_email, e)
        return False


def send_password_reset_email(to_email: str, otp: str) -> bool:
    """
    Send a password reset OTP via SMTP.
    Returns True on success, False on failure.
    """
    if not settings.smtp_user or not settings.smtp_password:
        logger.warning("SMTP credentials not configured — skipping reset email to %s", to_email)
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"BusLens — Password Reset Code: {otp}"
    msg["From"] = settings.smtp_user
    msg["To"] = to_email

    html = f"""
    <div style="font-family: 'Inter', 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: auto;
                padding: 32px; background: #ffffff; border-radius: 16px; border: 1px solid #eaeaea;
                box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #6d28d9; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">BusLens</h1>
        <div style="width: 40px; height: 4px; background: #8b5cf6; margin: 8px auto 0; border-radius: 2px;"></div>
      </div>
      <h2 style="margin: 0 0 12px 0; color: #1e293b; font-size: 20px;">Reset your password</h2>
      <p style="color: #64748b; margin: 0 0 24px 0; font-size: 15px; line-height: 1.5;">
        We received a request to reset your password. Use the code below to set a new password.
      </p>
      <div style="font-size: 36px; font-weight: 700; letter-spacing: 12px;
                  padding: 20px 24px; background: #f8fafc; border: 2px dashed #cbd5e1;
                  border-radius: 12px; text-align: center; color: #0f172a; margin-bottom: 24px;">
        {otp}
      </div>
      <div style="border-top: 1px solid #f1f5f9; padding-top: 20px;">
        <p style="color: #94a3b8; margin: 0; font-size: 13px;">
          This code expires in {settings.otp_expire_minutes} minutes.<br>
          If you didn't request a password reset, you can safely ignore this email.
        </p>
      </div>
    </div>
    """
    msg.attach(MIMEText(html, "html"))

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10) as server:
            server.starttls()
            server.login(settings.smtp_user, settings.smtp_password)
            server.sendmail(settings.smtp_user, to_email, msg.as_string())
        logger.info("Password reset email sent to %s", to_email)
        return True
    except Exception as e:
        logger.error("Failed to send password reset email to %s: %s", to_email, e)
        return False
