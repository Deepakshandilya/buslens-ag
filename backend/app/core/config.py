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

        self.secret_key = os.getenv("SECRET_KEY", "b3c959828461ab1057e627ceec3cd02082b26c6d267ac83f4bdbc82928509c12")
        self.algorithm = os.getenv("ALGORITHM", "HS256")
        self.access_token_expire_minutes = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
settings = Settings()
print(vars(settings))
