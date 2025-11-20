# Authentication API - cURL Commands for Localhost

This document contains ready-to-use cURL commands for testing all authentication endpoints on `localhost:3000`.

## Prerequisites

Make sure your Next.js development server is running:
```bash
npm run dev
```

The server should be accessible at `http://localhost:3000`

---

## 1. Register a New User

**Endpoint:** `POST /api/auth/register`

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "username": "johndoe",
    "password": "password123"
  }'
```

**Expected Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "username": "johndoe"
  }
}
```

**Error Response (400):**
```json
{
  "error": "Username already exists"
}
```

---

## 2. Login User

**Endpoint:** `POST /api/auth/login`

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "username": "johndoe",
    "password": "password123"
  }'
```

**Note:** The `-c cookies.txt` flag saves the session cookie to a file for subsequent requests.

**Expected Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "username": "johndoe"
  }
}
```

**Error Response (401):**
```json
{
  "error": "Invalid username or password"
}
```

---

## 3. Check Current Session / Get User Info

**Endpoint:** `GET /api/auth/me`

```bash
curl http://localhost:3000/api/auth/me \
  -b cookies.txt
```

**Note:** The `-b cookies.txt` flag sends the saved cookie with the request.

**Expected Response (200):**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "username": "johndoe"
  }
}
```

**Error Response (401):**
```json
{
  "error": "Not authenticated"
}
```

---

## 4. Logout User

**Endpoint:** `POST /api/auth/logout`

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt \
  -c cookies.txt
```

**Expected Response (200):**
```json
{
  "message": "Logout successful"
}
```

---

## Complete Test Flow

Here's a complete sequence to test the entire authentication flow:

### Step 1: Register a new user
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","username":"testuser","password":"test123"}'
```

### Step 2: Login with the registered user
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"username":"testuser","password":"test123"}'
```

### Step 3: Check if session is valid
```bash
curl http://localhost:3000/api/auth/me \
  -b cookies.txt
```

### Step 4: Logout
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt
```

### Step 5: Verify logout (should fail)
```bash
curl http://localhost:3000/api/auth/me \
  -b cookies.txt
```

---

## Windows PowerShell Commands

If you're using Windows PowerShell, use these commands instead:

### Register
```powershell
curl.exe -X POST http://localhost:3000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"name\":\"John Doe\",\"username\":\"johndoe\",\"password\":\"password123\"}'
```

### Login
```powershell
curl.exe -X POST http://localhost:3000/api/auth/login `
  -H "Content-Type: application/json" `
  -c cookies.txt `
  -d '{\"username\":\"johndoe\",\"password\":\"password123\"}'
```

### Check Session
```powershell
curl.exe http://localhost:3000/api/auth/me -b cookies.txt
```

### Logout
```powershell
curl.exe -X POST http://localhost:3000/api/auth/logout -b cookies.txt
```

---

## Testing with Invalid Credentials

### Test with wrong password:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "wrongpassword"
  }'
```

### Test with missing fields:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe"
  }'
```

---

## Testing Registration Validation

### Test with duplicate username:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Another User",
    "username": "johndoe",
    "password": "password123"
  }'
```

### Test with short password:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "username": "testuser2",
    "password": "123"
  }'
```

---

## Quick Reference

| Endpoint | Method | Purpose | Cookie Required |
|----------|--------|---------|----------------|
| `/api/auth/register` | POST | Register new user | No |
| `/api/auth/login` | POST | Login user | No (sets cookie) |
| `/api/auth/me` | GET | Check session | Yes |
| `/api/auth/logout` | POST | Logout user | Yes |

---

## Troubleshooting

1. **Connection Refused**: Make sure the Next.js server is running on port 3000
2. **401 Unauthorized**: Make sure you're sending the cookie with `-b cookies.txt`
3. **Cookie Not Saved**: Check that `cookies.txt` file is created after login
4. **CORS Issues**: These shouldn't occur with same-origin requests, but ensure you're using `localhost:3000`

---

## Example Output

### Successful Login:
```bash
$ curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"username":"johndoe","password":"password123"}'

{"message":"Login successful","user":{"id":1,"name":"John Doe","username":"johndoe"}}
```

### Check Session:
```bash
$ curl http://localhost:3000/api/auth/me -b cookies.txt

{"user":{"id":1,"name":"John Doe","username":"johndoe"}}
```

