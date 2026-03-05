import httpx

base_url = "http://localhost:8000/v1"

def test_health():
    res = httpx.get(f"{base_url}/health")
    print("Health:", res.status_code, res.json())

def test_register_login():
    email = "test2@example.com"
    password = "password123"
    
    # register
    res_reg = httpx.post(f"{base_url}/auth/register", json={"email": email, "password": password})
    print("Register:", res_reg.status_code, res_reg.text)
    
    # login
    res_login = httpx.post(f"{base_url}/auth/login", data={"username": email, "password": password})
    print("Login:", res_login.status_code, res_login.text)
    
    if res_login.status_code == 200:
        token = res_login.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # User Me
        res_me = httpx.get(f"{base_url}/users/me", headers=headers)
        print("Me:", res_me.status_code, res_me.text)
        
        # Get Favorites
        res_fav = httpx.get(f"{base_url}/users/me/favorites", headers=headers)
        print("Favorites:", res_fav.status_code, res_fav.text)

if __name__ == "__main__":
    try:
        test_health()
        test_register_login()
    except Exception as e:
        print("Error:", e)
