from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_routes_same_stop_returns_400():
    r = client.post("/v1/routes/search", json={"from_stop": "A", "to_stop": "A"})
    assert r.status_code == 400

def test_route_detail_invalid_direction():
    r = client.get("/v1/routes/20/sideways")
    assert r.status_code == 400