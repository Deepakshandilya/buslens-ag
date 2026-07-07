import os
from pathlib import Path

import pytest
from dotenv import load_dotenv
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.db.session import get_db

ROOT = Path(__file__).resolve().parents[1]
ENV_TEST = ROOT / ".env.test"
SCHEMA_SQL = ROOT / "migrations" / "schema.sqlite.sql"


def _db_url() -> str:
    return "sqlite:///:memory:"


@pytest.fixture(scope="session", autouse=True)
def load_test_env():
    if ENV_TEST.exists():
        load_dotenv(ENV_TEST, override=True)


@pytest.fixture(scope="session")
def engine():
    eng = create_engine(
        _db_url(),
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    @event.listens_for(eng, "connect")
    def set_sqlite_pragma(dbapi_conn, _):
        cursor = dbapi_conn.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

    return eng


@pytest.fixture(scope="session")
def SessionLocal(engine):
    return sessionmaker(bind=engine, autocommit=False, autoflush=False)


@pytest.fixture(scope="session", autouse=True)
def setup_schema(engine):
    sql = SCHEMA_SQL.read_text(encoding="utf-8")
    stmts = [s.strip() for s in sql.split(";") if s.strip()]
    with engine.begin() as conn:
        for stmt in stmts:
            conn.execute(text(stmt))
    yield


@pytest.fixture()
def db(SessionLocal):
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture(autouse=True)
def seed_data(engine):
    with engine.begin() as conn:
        conn.execute(text("DELETE FROM search_history"))
        conn.execute(text("DELETE FROM favorites"))
        conn.execute(text("DELETE FROM users"))
        conn.execute(text("DELETE FROM route_stops"))
        conn.execute(text("DELETE FROM routes"))
        conn.execute(text("DELETE FROM stops"))

        conn.execute(text("""
            INSERT INTO stops (id, name) VALUES
            (1, 'Kharar'),(2, 'Sante Majra'),(3, 'Chappar Chiri'),(4, 'ISBT Sector 43')
        """))

        conn.execute(text("""
            INSERT INTO routes (id, route_number, direction) VALUES
            (1, '20','DOWN'),(2, '20','UP')
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
    def _override_get_db():
        yield db

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
