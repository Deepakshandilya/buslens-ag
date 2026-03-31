import pytest

@pytest.fixture
def auth_token(client):
    email = "historyusr@example.com"
    client.post("/v1/auth/register", json={"email": email, "password": "password"})
    res = client.post("/v1/auth/login", data={"username": email, "password": "password"})
    return res.json()["access_token"]

@pytest.fixture
def auth_headers(auth_token):
    return {"Authorization": f"Bearer {auth_token}"}

def test_get_history_empty(client, auth_headers):
    res = client.get("/v1/users/me/history", headers=auth_headers)
    assert res.status_code == 200
    assert res.json() == []

def test_add_search_history(client, auth_headers):
    # Kharar (1) to ISBT Sector 43 (4)
    payload = {"from_stop_id": 1, "to_stop_id": 4}
    res = client.post("/v1/users/me/history", json=payload, headers=auth_headers)
    assert res.status_code == 201
    
    # Verify retrieval
    res = client.get("/v1/users/me/history", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 1
    assert data[0]["from_stop_id"] == 1
    assert data[0]["to_stop_id"] == 4
    assert data[0]["from_stop_name"] == "Kharar"
    assert data[0]["to_stop_name"] == "ISBT Sector 43"

def test_clear_search_history(client, auth_headers):
    client.post("/v1/users/me/history", json={"from_stop_id": 1, "to_stop_id": 2}, headers=auth_headers)
    client.post("/v1/users/me/history", json={"from_stop_id": 2, "to_stop_id": 3}, headers=auth_headers)
    
    assert len(client.get("/v1/users/me/history", headers=auth_headers).json()) == 2
    
    res = client.delete("/v1/users/me/history", headers=auth_headers)
    assert res.status_code == 200
    
    assert len(client.get("/v1/users/me/history", headers=auth_headers).json()) == 0
