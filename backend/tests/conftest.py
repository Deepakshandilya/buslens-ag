import os
from pathlib import Path

import pytest
from dotenv import load_dotenv
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.db.session import get_db

ROOT = Path(__file__).resolve().parents[1]
ENV_TEST = ROOT / ".env.test"
SCHEMA_SQL = ROOT / "tests" / "schema.sql"

def _db_url_from_env() -> str:
    host = os.getenv("DB_HOST", "localhost")
    port = int(os.getenv("DB_PORT", "3306"))
    name = os.getenv("DB_NAME", "buslens_testt")
    user = os.getenv("DB_USER", "root")
    pwd = os.getenv("DB_PASSWORD", "root")
    return f"mysql+pymysql://{user}:{pwd}@{host}:{port}/{name}"

@pytest.fixture(scope="session", autouse=True)
def load_test_env():
    # Loads DB_NAME=buslens_test etc for the entire pytest session
    load_dotenv(ENV_TEST, override=True)
    print("TEST ENV DB_NAME =", os.getenv("DB_NAME"))
    

@pytest.fixture(scope="session")
def engine():
    engine = create_engine(_db_url_from_env(), pool_pre_ping=True)
    return engine

@pytest.fixture(scope="session")
def SessionLocal(engine):
    return sessionmaker(bind=engine, autocommit=False, autoflush=False)

@pytest.fixture(scope="session", autouse=True)
def setup_schema(engine):
    # Create tables fresh for test DB
    sql = SCHEMA_SQL.read_text(encoding="utf-8")
    # Execute statements one by one
    stmts = [s.strip() for s in sql.split(";") if s.strip()]
    with engine.begin() as conn:
        for stmt in stmts:
            conn.execute(text(stmt))
    yield
    # Optional cleanup: drop tables after tests
    cleanup = """
    DROP TABLE IF EXISTS route_stops;
    DROP TABLE IF EXISTS routes;
    DROP TABLE IF EXISTS stops;
    """
    with engine.begin() as conn:
        for stmt in [s.strip() for s in cleanup.split(";") if s.strip()]:
            conn.execute(text(stmt))

@pytest.fixture()
def db(SessionLocal):
    # Each test gets its own transaction
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()

@pytest.fixture(autouse=True)
def seed_data(engine):
    # Seed minimal mock data before each test (fast + predictable)
    with engine.begin() as conn:
        conn.execute(text("DELETE FROM route_stops"))
        conn.execute(text("DELETE FROM routes"))
        conn.execute(text("DELETE FROM stops"))

        conn.execute(text("""
            INSERT INTO stops (name) VALUES
            ('Kharar'),('Sante Majra'),('Chappar Chiri'),('ISBT Sector 43')
        """))

        conn.execute(text("""
            INSERT INTO routes (route_number, direction) VALUES
            ('20','DOWN'),('20','UP')
        """))

        conn.execute(text("""
            INSERT INTO route_stops (route_id, stop_id, sequence_no)
            SELECT r.id, s.id, x.seq
            FROM routes r
            JOIN (
              SELECT 'Kharar' name, 1 seq UNION ALL
              SELECT 'Sante Majra', 2 UNION ALL
              SELECT 'Chappar Chiri', 3 UNION ALL
              SELECT 'ISBT Sector 43', 4
            ) x ON 1=1
            JOIN stops s ON s.name = x.name
            WHERE r.route_number='20' AND r.direction='DOWN'
        """))

        conn.execute(text("""
            INSERT INTO route_stops (route_id, stop_id, sequence_no)
            SELECT r.id, s.id, x.seq
            FROM routes r
            JOIN (
              SELECT 'ISBT Sector 43' name, 1 seq UNION ALL
              SELECT 'Chappar Chiri', 2 UNION ALL
              SELECT 'Sante Majra', 3 UNION ALL
              SELECT 'Kharar', 4
            ) x ON 1=1
            JOIN stops s ON s.name = x.name
            WHERE r.route_number='20' AND r.direction='UP'
        """))

@pytest.fixture()
def client(db):
    # Override FastAPI dependency to use the test DB session
    def _override_get_db():
        yield db

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()