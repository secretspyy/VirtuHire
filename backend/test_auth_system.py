"""
Test script for VirtuHire Authentication System
Run this after the backend is running to test registration and login
"""
import requests
import json
import sys

BASE_URL = "http://127.0.0.1:8000"
AUTH_BASE = f"{BASE_URL}/auth"

# Test user credentials
TEST_EMAIL = "testuser@example.com"
TEST_PASSWORD = "testpass123"
TEST_FULL_NAME = "Test User"
TEST_USERNAME = "testuser"

print("=" * 60)
print("VirtuHire Authentication Test Suite")
print("=" * 60)

# Test 1: Registration
print("\n[TEST 1] Testing User Registration...")
print(f"Attempting to register: {TEST_EMAIL}")

register_data = {
    "email": TEST_EMAIL,
    "password": TEST_PASSWORD,
    "full_name": TEST_FULL_NAME,
    "username": TEST_USERNAME
}

try:
    response = requests.post(f"{AUTH_BASE}/register", json=register_data)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        user_data = response.json()
        print("✅ Registration Successful!")
        print(f"   User ID: {user_data.get('id')}")
        print(f"   Email: {user_data.get('email')}")
        print(f"   Username: {user_data.get('username')}")
    else:
        print(f"❌ Registration Failed!")
        print(f"   Error: {response.json()}")
        
except Exception as e:
    print(f"❌ Connection Error: {e}")
    sys.exit(1)

# Test 2: Login
print("\n[TEST 2] Testing User Login...")
print(f"Attempting to login with email: {TEST_EMAIL}")

login_data = {
    "username": TEST_EMAIL,
    "password": TEST_PASSWORD
}

try:
    response = requests.post(
        f"{AUTH_BASE}/login",
        data=login_data,
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        token_data = response.json()
        access_token = token_data.get("access_token")
        token_type = token_data.get("token_type")
        print("✅ Login Successful!")
        print(f"   Token Type: {token_type}")
        print(f"   Access Token (first 50 chars): {access_token[:50]}...")
    else:
        print(f"❌ Login Failed!")
        print(f"   Error: {response.json()}")
        sys.exit(1)
        
except Exception as e:
    print(f"❌ Connection Error: {e}")
    sys.exit(1)

# Test 3: Access Protected Endpoint
print("\n[TEST 3] Testing Protected Endpoint (Get My Analyses)...")

headers = {
    "Authorization": f"Bearer {access_token}"
}

try:
    response = requests.get(f"{BASE_URL}/my-analyses", headers=headers)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        analyses = response.json()
        print("✅ Protected Endpoint Access Successful!")
        print(f"   Analyses count: {len(analyses)}")
        print(f"   Data: {json.dumps(analyses, indent=2)}")
    else:
        print(f"❌ Protected Endpoint Access Failed!")
        print(f"   Error: {response.json()}")
        
except Exception as e:
    print(f"❌ Connection Error: {e}")

# Test 4: Health Check
print("\n[TEST 4] Testing Health Endpoint...")

try:
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        print("✅ Backend is Healthy!")
        print(f"   Response: {response.json()}")
    else:
        print(f"❌ Health check failed!")
        
except Exception as e:
    print(f"❌ Connection Error: {e}")

print("\n" + "=" * 60)
print("Test Suite Complete!")
print("=" * 60)
print("\nIf all tests passed, your authentication system is working correctly!")
print("You can now try logging in from the React app at http://localhost:3000")

