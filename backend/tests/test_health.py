import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    r = client.get("/v1/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"

def test_health_db(client):
    r = client.get("/v1/health/db")
    assert r.status_code == 200