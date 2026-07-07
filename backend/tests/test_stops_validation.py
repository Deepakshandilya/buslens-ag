from fastapi.testclient import TestClient

def test_stops_short_query_returns_empty_list(client):
    r = client.get("/v1/stops", params={"query": "A", "limit": 10})
    assert r.status_code == 200
    data = r.json()
    assert data["results"] == []