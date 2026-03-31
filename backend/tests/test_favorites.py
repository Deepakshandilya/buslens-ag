import pytest

@pytest.fixture
def auth_token(client):
    # Register and return a token for an isolated user
    email = "favuser@example.com"
    client.post("/v1/auth/register", json={"email": email, "password": "password"})
    res = client.post("/v1/auth/login", data={"username": email, "password": "password"})
    return res.json()["access_token"]

@pytest.fixture
def auth_headers(auth_token):
    return {"Authorization": f"Bearer {auth_token}"}

def test_get_favorites_empty(client, auth_headers):
    res = client.get("/v1/users/me/favorites", headers=auth_headers)
    assert res.status_code == 200
    assert res.json() == []

def test_add_favorite_route(client, auth_headers):
    # Add a favorite route
    res = client.post("/v1/users/me/favorites", json={"route_id": 1}, headers=auth_headers)
    assert res.status_code == 201
    assert "added" in res.json()["message"]
    
    # Verify it was added
    res = client.get("/v1/users/me/favorites", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 1
    assert data[0]["route_id"] == 1
    assert data[0]["route_number"] == "20"
    assert data[0]["direction"] == "DOWN"

def test_add_favorite_stop(client, auth_headers):
    res = client.post("/v1/users/me/favorites", json={"stop_id": 1}, headers=auth_headers)
    assert res.status_code == 201
    
    res = client.get("/v1/users/me/favorites", headers=auth_headers)
    data = res.json()
    assert len(data) == 1
    assert data[0]["stop_id"] == 1
    assert data[0]["stop_name"] == "Kharar"

def test_add_favorite_invalid_payload(client, auth_headers):
    # Missing both
    res = client.post("/v1/users/me/favorites", json={}, headers=auth_headers)
    assert res.status_code == 400 # Manual validation in users.py
    
    # Both set
    res = client.post("/v1/users/me/favorites", json={"route_id": 1, "stop_id": 1}, headers=auth_headers)
    assert res.status_code == 400

def test_delete_favorite(client, auth_headers):
    client.post("/v1/users/me/favorites", json={"route_id": 1}, headers=auth_headers)
    res = client.get("/v1/users/me/favorites", headers=auth_headers)
    fav_id = res.json()[0]["id"]
    
    res = client.delete(f"/v1/users/me/favorites/{fav_id}", headers=auth_headers)
    assert res.status_code == 200
    
    res = client.get("/v1/users/me/favorites", headers=auth_headers)
    assert len(res.json()) == 0

def test_clear_favorites(client, auth_headers):
    client.post("/v1/users/me/favorites", json={"route_id": 1}, headers=auth_headers)
    client.post("/v1/users/me/favorites", json={"stop_id": 2}, headers=auth_headers)
    
    assert len(client.get("/v1/users/me/favorites", headers=auth_headers).json()) == 2
    
    res = client.delete("/v1/users/me/favorites", headers=auth_headers)
    assert res.status_code == 200
    assert len(client.get("/v1/users/me/favorites", headers=auth_headers).json()) == 0
