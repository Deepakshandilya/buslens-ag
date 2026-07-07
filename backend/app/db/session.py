from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

DATABASE_URL = f"sqlite:///{settings.db_path}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    pool_pre_ping=True,
)


@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_conn, _):
    cursor = dbapi_conn.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.execute("PRAGMA journal_mode=WAL")
    cursor.close()


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
