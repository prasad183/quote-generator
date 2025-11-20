# Authentication API Integration

This document describes the complete authentication system integration in the Quote Generator app.

## API Endpoints

### 1. **POST `/api/auth/register`**
- **Purpose**: Register a new user
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "username": "johndoe",
    "password": "password123"
  }
  ```
- **Response** (201): `{ "message": "User registered successfully", "user": {...} }`
- **Response** (400): `{ "error": "..." }`

### 2. **POST `/api/auth/login`**
- **Purpose**: Authenticate user and create session
- **Request Body**:
  ```json
  {
    "username": "johndoe",
    "password": "password123"
  }
  ```
- **Response** (200): `{ "message": "Login successful", "user": {...} }`
- **Response** (401): `{ "error": "Invalid username or password" }`
- **Sets HTTP-only session cookie** (valid for 7 days)

### 3. **GET `/api/auth/me`**
- **Purpose**: Check current authentication status
- **Headers**: Automatically uses session cookie
- **Response** (200): `{ "user": { "id": 1, "name": "John Doe", "username": "johndoe" } }`
- **Response** (401): `{ "error": "Not authenticated" }`

### 4. **POST `/api/auth/logout`**
- **Purpose**: End current session
- **Headers**: Automatically uses session cookie
- **Response** (200): `{ "message": "Logout successful" }`
- **Deletes session cookie**

## Frontend Integration

### Login Page (`/login`)
- ✅ Integrated with `POST /api/auth/login`
- ✅ Includes `credentials: "include"` for cookie handling
- ✅ Redirects to home page on successful login
- ✅ Shows error messages for failed login attempts
- ✅ Checks if already logged in and redirects if authenticated

### Registration Page (`/register`)
- ✅ Integrated with `POST /api/auth/register`
- ✅ Includes `credentials: "include"` for cookie handling
- ✅ Validates password confirmation
- ✅ Redirects to login page after successful registration
- ✅ Shows error messages for validation failures
- ✅ Checks if already logged in and redirects if authenticated

### Main App (`/`)
- ✅ Protected route - requires authentication
- ✅ Integrated with `GET /api/auth/me` to check authentication
- ✅ Redirects to `/login` if not authenticated
- ✅ Shows user name in header when logged in
- ✅ Integrated with `POST /api/auth/logout` for logout functionality
- ✅ Displays logout button in header

## Authentication Flow

1. **New User Registration**:
   - User visits `/register`
   - Fills in name, username, and password
   - Submits form → `POST /api/auth/register`
   - On success → Redirects to `/login`

2. **User Login**:
   - User visits `/login`
   - Enters username and password
   - Submits form → `POST /api/auth/login`
   - On success → Session cookie is set → Redirects to `/`

3. **Accessing Protected Routes**:
   - User visits `/` (main app)
   - App checks authentication → `GET /api/auth/me`
   - If authenticated → Shows app content
   - If not authenticated → Redirects to `/login`

4. **User Logout**:
   - User clicks logout button
   - App calls → `POST /api/auth/logout`
   - Session cookie is deleted → Redirects to `/login`

## Security Features

- ✅ **Password Hashing**: Passwords are hashed using SHA-256
- ✅ **HTTP-Only Cookies**: Session cookies are HTTP-only (prevents XSS attacks)
- ✅ **Input Validation**: Both client-side and server-side validation
- ✅ **Username Uniqueness**: Prevents duplicate usernames
- ✅ **Session Verification**: Validates user exists on each auth check
- ✅ **Automatic Cookie Handling**: All fetch calls include `credentials: "include"`

## Utility Functions

A utility library is available at `lib/auth.js` with helper functions:
- `checkAuth()` - Check authentication status
- `login(username, password)` - Login user
- `register(name, username, password)` - Register user
- `logout()` - Logout user

## Testing the Integration

### Using cURL:

**Register:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","username":"johndoe","password":"password123"}'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"username":"johndoe","password":"password123"}'
```

**Check Session:**
```bash
curl http://localhost:3000/api/auth/me \
  -b cookies.txt
```

**Logout:**
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt
```

## Notes

- All API endpoints are fully integrated into the frontend
- Session cookies are automatically handled by the browser
- The app redirects unauthenticated users to the login page
- User data is stored in `data/users.json` (excluded from git)
- Session cookies expire after 7 days

