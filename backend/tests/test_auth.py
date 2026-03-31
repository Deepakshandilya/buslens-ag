import pytest
from httpx import Response

def test_register_new_user(client):
    response: Response = client.post(
        "/v1/auth/register",
        json={"email": "test@example.com", "password": "testpassword123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert "id" in data

def test_register_duplicate_user(client):
    client.post(
        "/v1/auth/register",
        json={"email": "duplicate@example.com", "password": "testpassword123"}
    )
    response: Response = client.post(
        "/v1/auth/register",
        json={"email": "duplicate@example.com", "password": "testpassword123"}
    )
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]

def test_login_success(client):
    client.post(
        "/v1/auth/register",
        json={"email": "login@example.com", "password": "testpassword123"}
    )
    response: Response = client.post(
        "/v1/auth/login",
        data={"username": "login@example.com", "password": "testpassword123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_incorrect_password(client):
    client.post(
        "/v1/auth/register",
        json={"email": "wrongpwd@example.com", "password": "testpassword123"}
    )
    response: Response = client.post(
        "/v1/auth/login",
        data={"username": "wrongpwd@example.com", "password": "wrongpassword"}
    )
    assert response.status_code == 401

def test_get_users_me(client):
    # Register and Login
    client.post(
        "/v1/auth/register",
        json={"email": "me@example.com", "password": "testpassword123"}
    )
    login_response = client.post(
        "/v1/auth/login",
        data={"username": "me@example.com", "password": "testpassword123"}
    )
    token = login_response.json()["access_token"]
    
    # Get Me
    response: Response = client.get(
        "/v1/users/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["email"] == "me@example.com"

def test_get_users_me_unauthenticated(client):
    response: Response = client.get("/v1/users/me")
    assert response.status_code == 401
