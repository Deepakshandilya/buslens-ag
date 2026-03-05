import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_stops_search(client):
    r = client.get("/v1/stops", params={"query": "Kha", "limit": 10})
    assert r.status_code == 200
    data = r.json()
    assert any("Kharar" in x["name"] for x in data["results"])
