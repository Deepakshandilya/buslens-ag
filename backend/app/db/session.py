from sqlalchemy import create_engine 
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

DATABASE_URL = (
    f"mysql+pymysql://{settings.db_user}:{settings.db_password}"
    f"@{settings.db_host}:{settings.db_port}/{settings.db_name}"
)

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """
    FastAPI dependency:
    yields a DB session and ensures it closes.
    """
    
    db = SessionLocal()
    try:
        yield db
    finally: 
        db.close()

