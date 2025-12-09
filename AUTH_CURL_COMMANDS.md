# 🔐 Authentication API Documentation

<div align="center">

**Complete Guide to Authentication Endpoints**

*Ready-to-use API commands for seamless integration*

[![API Status](https://img.shields.io/badge/API-Ready-success)](http://localhost:3000)
[![Documentation](https://img.shields.io/badge/Docs-Complete-blue)](.)
[![License](https://img.shields.io/badge/License-MIT-green)](.)

</div>

---

## 📋 Table of Contents

- [🚀 Quick Start](#-quick-start)
- [✨ API Endpoints](#-api-endpoints)
- [📖 Detailed Examples](#-detailed-examples)
- [🔄 Complete Test Flow](#-complete-test-flow)
- [💻 Windows PowerShell](#-windows-powershell-commands)
- [🧪 Testing Scenarios](#-testing-scenarios)
- [📊 Quick Reference](#-quick-reference)
- [🔧 Troubleshooting](#-troubleshooting)

---

## 🚀 Quick Start

### Prerequisites

✅ **Ensure your Next.js development server is running:**

```bash
npm run dev
```

🌐 **Server URL:** `http://localhost:3000`

> 💡 **Tip:** Keep this terminal open while testing the API endpoints.

---

## ✨ API Endpoints

| Endpoint | Method | Description | Authentication |
|:---------|:-------|:------------|:---------------|
| `/api/auth/register` | `POST` | Create a new user account | ❌ Not Required |
| `/api/auth/login` | `POST` | Authenticate and create session | ❌ Not Required |
| `/api/auth/me` | `GET` | Get current user information | ✅ Required |
| `/api/auth/logout` | `POST` | End current session | ✅ Required |

---

## 📖 Detailed Examples

### 1️⃣ Register a New User

**Endpoint:** `POST /api/auth/register`

**Purpose:** Create a new user account in the system.

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "username": "johndoe",
    "password": "password123"
  }'
```

**✅ Success Response (201):**
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

**❌ Error Response (400):**
```json
{
  "error": "Username already exists"
}
```

---

### 2️⃣ Login User

**Endpoint:** `POST /api/auth/login`

**Purpose:** Authenticate user credentials and establish a session.

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "username": "johndoe",
    "password": "password123"
  }'
```

> 📝 **Important:** The `-c cookies.txt` flag saves the session cookie for authenticated requests.

**✅ Success Response (200):**
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

**❌ Error Response (401):**
```json
{
  "error": "Invalid username or password"
}
```

---

### 3️⃣ Get Current User Info

**Endpoint:** `GET /api/auth/me`

**Purpose:** Retrieve information about the currently authenticated user.

**Request:**
```bash
curl http://localhost:3000/api/auth/me \
  -b cookies.txt
```

> 📝 **Note:** The `-b cookies.txt` flag sends the saved authentication cookie.

**✅ Success Response (200):**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "username": "johndoe"
  }
}
```

**❌ Error Response (401):**
```json
{
  "error": "Not authenticated"
}
```

---

### 4️⃣ Logout User

**Endpoint:** `POST /api/auth/logout`

**Purpose:** End the current user session.

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt \
  -c cookies.txt
```

**✅ Success Response (200):**
```json
{
  "message": "Logout successful"
}
```

---

## 🔄 Complete Test Flow

Follow this step-by-step guide to test the entire authentication flow:

### Step 1: Register a New User 👤

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","username":"testuser","password":"test123"}'
```

**Expected:** `201 Created` with user details

---

### Step 2: Login with Credentials 🔑

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"username":"testuser","password":"test123"}'
```

**Expected:** `200 OK` with user details and cookie saved

---

### Step 3: Verify Session ✅

```bash
curl http://localhost:3000/api/auth/me \
  -b cookies.txt
```

**Expected:** `200 OK` with authenticated user information

---

### Step 4: Logout 🚪

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt
```

**Expected:** `200 OK` with logout confirmation

---

### Step 5: Verify Logout (Should Fail) ❌

```bash
curl http://localhost:3000/api/auth/me \
  -b cookies.txt
```

**Expected:** `401 Unauthorized` - Session is invalid

---

## 💻 Windows PowerShell Commands

For Windows users, use these PowerShell-compatible commands:

### Register User
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

## 🧪 Testing Scenarios

### Test Invalid Credentials

**Wrong Password:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "wrongpassword"
  }'
```

**Expected:** `401 Unauthorized`

---

### Test Missing Fields

**Missing Password:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe"
  }'
```

**Expected:** `400 Bad Request`

---

### Test Registration Validation

**Duplicate Username:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Another User",
    "username": "johndoe",
    "password": "password123"
  }'
```

**Expected:** `400 Bad Request` - Username already exists

---

**Short Password:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "username": "testuser2",
    "password": "123"
  }'
```

**Expected:** `400 Bad Request` - Password validation error

---

## 📊 Quick Reference

### Request Headers

All POST requests require:
```
Content-Type: application/json
```

### Cookie Management

- **Save cookie:** Use `-c cookies.txt` flag
- **Send cookie:** Use `-b cookies.txt` flag
- **Cookie file:** Created automatically after login

### Response Status Codes

| Code | Meaning | Description |
|:-----|:--------|:------------|
| `200` | ✅ Success | Request completed successfully |
| `201` | ✅ Created | Resource created successfully |
| `400` | ❌ Bad Request | Invalid input or validation error |
| `401` | ❌ Unauthorized | Authentication required or failed |
| `500` | ❌ Server Error | Internal server error |

---

## 🔧 Troubleshooting

### Common Issues and Solutions

| Issue | Solution |
|:------|:---------|
| 🔴 **Connection Refused** | Ensure Next.js server is running: `npm run dev` |
| 🔴 **401 Unauthorized** | Include cookie with `-b cookies.txt` flag |
| 🔴 **Cookie Not Saved** | Verify `cookies.txt` file exists after login |
| 🔴 **CORS Issues** | Use `localhost:3000` for same-origin requests |
| 🔴 **JSON Parse Error** | Ensure proper JSON formatting in request body |

---

## 📝 Example Output

### Successful Login Response

```bash
$ curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"username":"johndoe","password":"password123"}'

{"message":"Login successful","user":{"id":1,"name":"John Doe","username":"johndoe"}}
```

### Successful Session Check

```bash
$ curl http://localhost:3000/api/auth/me -b cookies.txt

{"user":{"id":1,"name":"John Doe","username":"johndoe"}}
```

---

## 📞 Support

For additional help or questions:

- 📧 Check the main API documentation
- 🐛 Report issues in the project repository
- 💬 Contact the development team

---

<div align="center">

**Made with ❤️ for seamless API integration**

*Last Updated: 2024*

</div>
