import os 
from dataclasses import dataclass 
from dotenv import load_dotenv 
from typing import List
load_dotenv()


# _ func for the private function -> internals 
def _get_env(name: str, default: str | None = None ) -> str:
    val = os.getenv(name,default)
    if val is None: 
        raise RuntimeError(f"Missing Required env var : {name}")
    return val 


# list comprehensions 
def _parse_origins(raw: str) -> list[str]: 
    # "a,b,c" -> ["a","b","c"]
    items = [x.strip() for x in (raw or "").split(",")]
    return [x for x in items if x ]

# @dataclass(frozen=True)
class Settings:
    def __init__(self):
        self.app_env = os.getenv("APP_ENV", "local")

        self.db_host = os.getenv("DB_HOST", "localhost")
        self.db_port = int(os.getenv("DB_PORT", "3306"))
        self.db_name = os.getenv("DB_NAME", "buslens")
        self.db_user = os.getenv("DB_USER", "buslens_user")
        self.db_password = os.getenv("DB_PASSWORD", "buslens_password")

        raw_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173")
        self.cors_origins: List[str] = [
            origin.strip()
            for origin in raw_origins.split(",")
            if origin.strip()
        ]

        self.secret_key = os.getenv("SECRET_KEY")
        if not self.secret_key:
            if self.app_env == "local":
                self.secret_key = "dev-only-insecure-key-change-in-production"
            else:
                raise RuntimeError("SECRET_KEY env var is required in non-local environments")
        self.algorithm = os.getenv("ALGORITHM", "HS256")
        self.access_token_expire_minutes = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

        # SMTP for OTP emails
        self.smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_user = os.getenv("SMTP_USER", "")
        self.smtp_password = os.getenv("SMTP_PASSWORD", "")
        self.otp_expire_minutes = int(os.getenv("OTP_EXPIRE_MINUTES", "10"))

        # Google OAuth
        self.google_client_id = os.getenv("GOOGLE_CLIENT_ID", "")
        self.google_client_secret = os.getenv("GOOGLE_CLIENT_SECRET", "")
        self.google_redirect_uri = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/v1/auth/google/callback")
        self.frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    
settings = Settings()
