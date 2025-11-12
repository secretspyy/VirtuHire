# 🚀 Quick Start - VirtuHire Authentication

## ⚡ Get Running in 60 Seconds

### 1. Start Backend
```powershell
cd backend
./venv/Scripts/python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000
```
✅ Backend running at: http://127.0.0.1:8000

### 2. Start Frontend (in new terminal)
```powershell
cd react-electron-app
npm start
```
✅ Frontend running at: http://localhost:3000

### 3. Test Authentication
**Option A:** Use the React UI
- Open http://localhost:3000
- Click "Don't have an account? Register"
- Fill form and register
- Should redirect to recorder page

**Option B:** Run automated tests
```powershell
cd backend
./venv/Scripts/python.exe test_auth_system.py
```

---

## 📋 Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login (returns token) |
| GET | `/my-analyses` | Get user's analyses (protected) |
| POST | `/analyze-audio` | Upload audio (protected) |
| GET | `/profile/me` | Get user profile (protected) |

---

## 🔑 Login Format

**Request:**
```
POST /auth/login
Content-Type: application/x-www-form-urlencoded

username=email@example.com&password=mypassword
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

**Use token for protected endpoints:**
```
GET /my-analyses
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

## 📁 Database

- **Location:** `backend/virtuhire.db`
- **Type:** SQLite (no server needed)
- **Auto-created:** First run

---

## ✅ Verification Checklist

- [ ] Backend starts without errors
- [ ] Frontend opens at localhost:3000
- [ ] Can register a new user
- [ ] Can login with registered credentials
- [ ] Redirected to recorder page after login
- [ ] Token saved in browser localStorage
- [ ] Protected endpoints return 401 without token

---

## 🛠️ Files Modified

1. `backend/routers/auth.py` - JWT validation
2. `backend/routers/profile.py` - Fixed imports
3. `backend/database.py` - SQLite setup
4. `react-electron-app/src/pages/Login.js` - Endpoint URL
5. `backend/requirements.txt` - Dependencies

---

## 📚 Documentation

- **Full Guide:** `AUTHENTICATION_FIX_GUIDE.md`
- **Code Changes:** `CODE_CHANGES_DETAILED.md`
- **Summary:** `AUTH_FIXES_SUMMARY.md`

---

## ❌ Troubleshooting

**Port 8000 in use?**
```powershell
taskkill /F /IM python.exe
```

**Module not found?**
```powershell
cd backend
./venv/Scripts/python.exe -m pip install -r requirements.txt
```

**Login fails?**
1. Check backend is running
2. Verify email/password are correct
3. Check browser console for errors
4. Run test script: `test_auth_system.py`

---

## 🎯 What's Working Now

✅ User registration with password hashing
✅ User login with JWT tokens
✅ Protected endpoints requiring authentication
✅ Token expiration (60 minutes)
✅ Database persistence with SQLite
✅ CORS configured for frontend
✅ Error handling and validation

---

**Ready? Start the backend and test it!** 🚀

