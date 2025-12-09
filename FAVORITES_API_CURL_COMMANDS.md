# Favorites API - cURL Commands & Postman Setup

Complete guide for testing the User Favorites API endpoints with cURL and Postman.

## ⚠️ Important: Authentication Setup

**All favorites endpoints require authentication.** You must login first to get a session cookie.

---

## Step 1: Login to Get Session Cookie

### Using cURL

```bash
# Login and save cookies to file
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "password123"
  }' \
  -c cookies.txt \
  -v
```

**Important**: The `-c cookies.txt` saves the cookie. Use `-b cookies.txt` in subsequent requests.

### Using Postman

1. **Create a Login Request:**
   - Method: `POST`
   - URL: `http://localhost:3000/api/auth/login`
   - Headers: `Content-Type: application/json`
   - Body (raw JSON):
     ```json
     {
       "username": "johndoe",
       "password": "password123"
     }
     ```

2. **Enable Cookie Handling in Postman:**
   - Go to **Settings** (gear icon)
   - Enable **"Automatically follow redirects"**
   - Enable **"Save cookies"**
   - Or manually copy the cookie from the response headers

3. **Get Cookie from Response:**
   - After login, check the **Cookies** tab in Postman
   - Or check **Headers** in the response
   - Look for: `Set-Cookie: auth-session=...`
   - Copy the entire cookie value

4. **Set Cookie in Favorites Requests:**
   - In your favorites request, go to **Headers** tab
   - Add header: `Cookie: auth-session=YOUR_COOKIE_VALUE`
   - Or use Postman's **Cookies** feature (it should auto-include if enabled)

---

## Step 2: Test Authentication (Verify Session)

### Check if you're authenticated:

```bash
curl -X GET "http://localhost:3000/api/auth/me" \
  -b cookies.txt \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "username": "johndoe"
  }
}
```

If this works, your session is valid. If not, login again.

---

## Step 3: Favorites API Endpoints

### 1. GET - Get User Favorites

#### Basic Request
```bash
curl -X GET "http://localhost:3000/api/user/favorites" \
  -b cookies.txt \
  -H "Content-Type: application/json"
```

#### With Pagination
```bash
curl -X GET "http://localhost:3000/api/user/favorites?page=1&limit=50" \
  -b cookies.txt \
  -H "Content-Type: application/json"
```

#### Using Cookie Directly (if you have the value)
```bash
curl -X GET "http://localhost:3000/api/user/favorites?page=1&limit=50" \
  -H "Cookie: auth-session={\"id\":\"507f1f77bcf86cd799439011\",\"name\":\"John Doe\",\"username\":\"johndoe\"}" \
  -H "Content-Type: application/json"
```

**Postman Setup:**
- Method: `GET`
- URL: `http://localhost:3000/api/user/favorites?page=1&limit=50`
- Headers:
  - `Cookie: auth-session=YOUR_COOKIE_VALUE`
  - `Content-Type: application/json`

**Expected Response (200):**
```json
{
  "favorites": [
    {
      "quoteId": 123,
      "text": "The only way to do great work is to love what you do.",
      "author": "Steve Jobs",
      "category": "motivation",
      "favoritedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1,
    "totalPages": 1
  },
  "success": true
}
```

---

### 2. POST - Add Favorite Quote

#### Basic Request
```bash
curl -X POST "http://localhost:3000/api/user/favorites" \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "quoteId": 123,
    "text": "The only way to do great work is to love what you do.",
    "author": "Steve Jobs",
    "category": "motivation"
  }'
```

#### With quoteId as String (auto-converted)
```bash
curl -X POST "http://localhost:3000/api/user/favorites" \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "quoteId": "123",
    "text": "The only way to do great work is to love what you do.",
    "author": "Steve Jobs",
    "category": "motivation"
  }'
```

#### Without Category (optional)
```bash
curl -X POST "http://localhost:3000/api/user/favorites" \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "quoteId": 456,
    "text": "Life is what happens to you while you are busy making other plans.",
    "author": "John Lennon"
  }'
```

**Postman Setup:**
- Method: `POST`
- URL: `http://localhost:3000/api/user/favorites`
- Headers:
  - `Cookie: auth-session=YOUR_COOKIE_VALUE`
  - `Content-Type: application/json`
- Body (raw JSON):
  ```json
  {
    "quoteId": 123,
    "text": "The only way to do great work is to love what you do.",
    "author": "Steve Jobs",
    "category": "motivation"
  }
  ```

**Expected Response (201):**
```json
{
  "favorite": {
    "quoteId": 123,
    "text": "The only way to do great work is to love what you do.",
    "author": "Steve Jobs",
    "category": "motivation",
    "favoritedAt": "2024-01-15T10:30:00.000Z"
  },
  "success": true
}
```

**If Already Favorited (200):**
```json
{
  "favorite": {
    "quoteId": 123,
    "text": "The only way to do great work is to love what you do.",
    "author": "Steve Jobs",
    "category": "motivation",
    "favoritedAt": "2024-01-15T10:30:00.000Z"
  },
  "success": true,
  "message": "Already favorited"
}
```

---

### 3. DELETE - Remove Favorite Quote

#### Basic Request
```bash
curl -X DELETE "http://localhost:3000/api/user/favorites?quoteId=123" \
  -b cookies.txt \
  -H "Content-Type: application/json"
```

**Postman Setup:**
- Method: `DELETE`
- URL: `http://localhost:3000/api/user/favorites?quoteId=123`
- Headers:
  - `Cookie: auth-session=YOUR_COOKIE_VALUE`
  - `Content-Type: application/json`

**Expected Response (200):**
```json
{
  "message": "Favorite removed successfully",
  "success": true
}
```

---

## Complete Workflow Example

### Step 1: Register User (if not exists)
```bash
curl -X POST "http://localhost:3000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "username": "johndoe",
    "password": "password123"
  }'
```

### Step 2: Login and Save Cookie
```bash
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "password123"
  }' \
  -c cookies.txt \
  -v
```

**Check the response** - you should see:
- Status: 200
- Response: `{"message": "Login successful", "user": {...}}`
- Headers: `Set-Cookie: auth-session=...`

### Step 3: Verify Authentication
```bash
curl -X GET "http://localhost:3000/api/auth/me" \
  -b cookies.txt
```

**Expected:** `{"user": {...}}` (200 status)

### Step 4: Add Favorite
```bash
curl -X POST "http://localhost:3000/api/user/favorites" \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "quoteId": 123,
    "text": "The only way to do great work is to love what you do.",
    "author": "Steve Jobs",
    "category": "motivation"
  }'
```

### Step 5: Get Favorites
```bash
curl -X GET "http://localhost:3000/api/user/favorites?page=1&limit=50" \
  -b cookies.txt
```

### Step 6: Remove Favorite
```bash
curl -X DELETE "http://localhost:3000/api/user/favorites?quoteId=123" \
  -b cookies.txt
```

---

## Postman Cookie Setup (Detailed)

### Method 1: Automatic Cookie Management

1. **Enable Cookie Management:**
   - Open Postman Settings (⚙️ icon)
   - Go to **General** tab
   - Enable **"Automatically follow redirects"**
   - Enable **"Save cookies"**

2. **Login First:**
   - Send the login request
   - Postman will automatically save the cookie

3. **Use in Other Requests:**
   - Postman will automatically include the cookie in subsequent requests
   - Make sure you're using the same domain (localhost:3000)

### Method 2: Manual Cookie Header

1. **Get Cookie Value:**
   - After login, check the **Cookies** tab in Postman
   - Or check response **Headers** for `Set-Cookie`
   - Copy the entire cookie value

2. **Add Cookie Header:**
   - In your favorites request, go to **Headers** tab
   - Add: `Cookie` as key
   - Value: `auth-session=YOUR_COOKIE_VALUE`
   - Example: `auth-session={"id":"507f1f77bcf86cd799439011","name":"John Doe","username":"johndoe"}`

### Method 3: Using Postman Environment Variables

1. **Create Environment:**
   - Click **Environments** in left sidebar
   - Click **+** to create new environment
   - Name it "Local Development"

2. **Set Variables:**
   - `base_url`: `http://localhost:3000`
   - `auth_cookie`: (will be set after login)

3. **Login Request:**
   - Use `{{base_url}}/api/auth/login`
   - In **Tests** tab, add:
     ```javascript
     const cookies = pm.cookies.toObject();
     pm.environment.set("auth_cookie", cookies["auth-session"]);
     ```

4. **Favorites Requests:**
   - Use `{{base_url}}/api/user/favorites`
   - In **Headers**, add:
     - Key: `Cookie`
     - Value: `auth-session={{auth_cookie}}`

---

## Troubleshooting "Invalid Session" Error

### Issue: Getting "Invalid session" or "Not authenticated" error

#### Solution 1: Check Cookie Format
The cookie value should be a JSON string. Example:
```
auth-session={"id":"507f1f77bcf86cd799439011","name":"John Doe","username":"johndoe"}
```

#### Solution 2: Verify Login Worked
```bash
# Test login
curl -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "johndoe", "password": "password123"}' \
  -v
```

Look for `Set-Cookie: auth-session=...` in the response headers.

#### Solution 3: Test Authentication Endpoint
```bash
curl -X GET "http://localhost:3000/api/auth/me" \
  -b cookies.txt
```

If this fails, your cookie is invalid. Login again.

#### Solution 4: Check Cookie in Postman
1. After login, go to **Cookies** tab
2. Click on `localhost:3000`
3. Verify `auth-session` cookie exists
4. Check the cookie value format

#### Solution 5: Manual Cookie Extraction
If automatic cookie handling doesn't work:

1. **Login and get response:**
   ```bash
   curl -X POST "http://localhost:3000/api/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"username": "johndoe", "password": "password123"}' \
     -v 2>&1 | grep -i "set-cookie"
   ```

2. **Extract cookie value** (it's JSON-encoded)

3. **Use in requests:**
   ```bash
   curl -X GET "http://localhost:3000/api/user/favorites" \
     -H "Cookie: auth-session=EXTRACTED_VALUE" \
     -H "Content-Type: application/json"
   ```

---

## PowerShell Commands (Windows)

### Login and Save Cookie
```powershell
$loginBody = @{
    username = "johndoe"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" `
  -Method POST `
  -Headers @{"Content-Type" = "application/json"} `
  -Body $loginBody `
  -SessionVariable session

# Cookie is now in $session.Cookies
```

### Get Favorites (using session)
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/user/favorites?page=1&limit=50" `
  -Method GET `
  -WebSession $session `
  -Headers @{"Content-Type" = "application/json"}
```

### Add Favorite
```powershell
$body = @{
    quoteId = 123
    text = "The only way to do great work is to love what you do."
    author = "Steve Jobs"
    category = "motivation"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/user/favorites" `
  -Method POST `
  -WebSession $session `
  -Headers @{"Content-Type" = "application/json"} `
  -Body $body
```

### Remove Favorite
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/user/favorites?quoteId=123" `
  -Method DELETE `
  -WebSession $session `
  -Headers @{"Content-Type" = "application/json"}
```

---

## Error Responses

### 401 - Not Authenticated
```json
{
  "error": "Not authenticated - No session cookie",
  "details": "Check if you're logged in and session cookie is valid"
}
```

**Solution:** Login first and include the cookie in your request.

### 401 - Invalid Session
```json
{
  "error": "Invalid session - Cookie parse error"
}
```

**Solution:** The cookie format is incorrect. Login again to get a fresh cookie.

### 401 - User Not Found
```json
{
  "error": "User not found"
}
```

**Solution:** The user in the session no longer exists. Register/login again.

### 400 - Missing Fields
```json
{
  "error": "quoteId (number), text, and author are required"
}
```

**Solution:** Ensure all required fields are provided in the request body.

### 404 - Favorite Not Found
```json
{
  "error": "Favorite not found"
}
```

**Solution:** The quoteId doesn't exist in your favorites. Check with GET first.

---

## Quick Test Script

Save this as `test-favorites.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3000"
USERNAME="johndoe"
PASSWORD="password123"

echo "1. Logging in..."
curl -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"$USERNAME\", \"password\": \"$PASSWORD\"}" \
  -c cookies.txt \
  -s | jq .

echo -e "\n2. Checking authentication..."
curl -X GET "$BASE_URL/api/auth/me" \
  -b cookies.txt \
  -s | jq .

echo -e "\n3. Getting favorites..."
curl -X GET "$BASE_URL/api/user/favorites?page=1&limit=50" \
  -b cookies.txt \
  -s | jq .

echo -e "\n4. Adding favorite..."
curl -X POST "$BASE_URL/api/user/favorites" \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{
    "quoteId": 123,
    "text": "The only way to do great work is to love what you do.",
    "author": "Steve Jobs",
    "category": "motivation"
  }' \
  -s | jq .

echo -e "\n5. Getting favorites again..."
curl -X GET "$BASE_URL/api/user/favorites?page=1&limit=50" \
  -b cookies.txt \
  -s | jq .

echo -e "\n6. Removing favorite..."
curl -X DELETE "$BASE_URL/api/user/favorites?quoteId=123" \
  -b cookies.txt \
  -s | jq .

echo -e "\nDone!"
```

Make it executable and run:
```bash
chmod +x test-favorites.sh
./test-favorites.sh
```

---

## Summary

| Endpoint | Method | Auth | Cookie Required |
|----------|--------|------|-----------------|
| `/api/user/favorites` | GET | ✅ Yes | ✅ Yes |
| `/api/user/favorites` | POST | ✅ Yes | ✅ Yes |
| `/api/user/favorites` | DELETE | ✅ Yes | ✅ Yes |

**Remember:**
1. ✅ Always login first to get session cookie
2. ✅ Include cookie in all favorites requests
3. ✅ Use `-b cookies.txt` in cURL or Cookie header in Postman
4. ✅ Verify authentication with `/api/auth/me` if having issues

