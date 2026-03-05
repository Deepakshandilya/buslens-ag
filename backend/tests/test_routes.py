import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_routes_validation_same_stop():
    r = client.post("/v1/routes/search", json={"from_stop": "A", "to_stop": "A"})
    assert r.status_code == 400

def test_routes_search(client):
    r = client.post("/v1/routes/search", json={"from_stop": "Kharar", "to_stop": "ISBT Sector 43"})
    assert r.status_code == 200
    data = r.json()
    assert any(x["route_number"] == "20" and x["direction"] == "DOWN" for x in data)
