# backend/test_auth.py
import requests

BASE_URL = "http://127.0.0.1:8000/auth"

# ---------- Test Registration ----------
register_data = {
    "email": "testuser@example.com",
    "password": "testpassword123",
    "full_name": "Test User",
    "username": "testuser"
}

res = requests.post(f"{BASE_URL}/register", json=register_data)
print("Register:", res.json())

# ---------- Test Login ----------
login_data = {
    "email": "testuser@example.com",
    "password": "testpassword123"
}

res = requests.post(f"{BASE_URL}/login", json=login_data)
#print("Login:", res.json())
# Debugging: check status and raw response before parsing JSON
print("Status:", res.status_code)
print("Raw Response:", res.text)


# Extract token
token = res.json().get("access_token")
print("Token:", token)

# ---------- Test Protected Endpoint ----------
if token:
    headers = {"Authorization": f"Bearer {token}"}
    res = requests.get("http://127.0.0.1:8000/my-analyses", headers=headers)
    print("My Analyses:", res.json())
