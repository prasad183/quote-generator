# Collections API - cURL Commands

This document contains cURL commands for all Collections API endpoints. All endpoints use collection **names** instead of IDs.

## Base URL
```
http://localhost:3000
```

---

## 1. Get All Collections

Get a list of all collections with their quotes.

### Request
```bash
curl -X GET http://localhost:3000/api/collections
```

### Windows PowerShell
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/collections" -Method GET
```

### Expected Response
```json
{
  "collections": [
    {
      "id": "1234567890-abc123",
      "name": "My Favorite Quotes",
      "quotes": [
        {
          "id": "quote-id-1",
          "text": "The only way to do great work is to love what you do.",
          "author": "Steve Jobs",
          "addedAt": "2024-01-01T12:00:00.000Z"
        }
      ],
      "createdAt": "2024-01-01T10:00:00.000Z"
    }
  ],
  "count": 1,
  "success": true
}
```

---

## 2. Get Collection by Name

Get a specific collection by its name.

### Request
```bash
curl -X GET "http://localhost:3000/api/collections?name=My Favorite Quotes"
```

### Windows PowerShell
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/collections?name=My Favorite Quotes" -Method GET
```

### Expected Response
```json
{
  "collection": {
    "id": "1234567890-abc123",
    "name": "My Favorite Quotes",
    "quotes": [
      {
        "id": "quote-id-1",
        "text": "The only way to do great work is to love what you do.",
        "author": "Steve Jobs",
        "addedAt": "2024-01-01T12:00:00.000Z"
      }
    ],
    "createdAt": "2024-01-01T10:00:00.000Z"
  },
  "success": true
}
```

### Error Response

**404 Not Found** - Collection not found
```json
{
  "error": "Collection not found"
}
```

---

## 3. Create Collection

Create a new collection with a name.

### Request
```bash
curl -X POST http://localhost:3000/api/collections \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Favorite Quotes"
  }'
```

### Windows PowerShell
```powershell
$body = @{
    name = "My Favorite Quotes"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/collections" -Method POST -Body $body -ContentType "application/json"
```

### Expected Response
```json
{
  "id": "1234567890-abc123",
  "name": "My Favorite Quotes",
  "quotes": [],
  "createdAt": "2024-01-01T10:00:00.000Z"
}
```

### Error Responses

**400 Bad Request** - Invalid or missing name
```json
{
  "error": "Collection name is required and must be a non-empty string"
}
```

**409 Conflict** - Collection with same name already exists
```json
{
  "error": "A collection with this name already exists"
}
```

---

## 4. Update Collection

Update a collection's name.

### Request
```bash
curl -X PUT "http://localhost:3000/api/collections?name=My Favorite Quotes" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Collection Name"
  }'
```

### Windows PowerShell
```powershell
$body = @{
    name = "Updated Collection Name"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/collections?name=My Favorite Quotes" -Method PUT -Body $body -ContentType "application/json"
```

### Expected Response
```json
{
  "collection": {
    "id": "1234567890-abc123",
    "name": "Updated Collection Name",
    "quotes": [],
    "createdAt": "2024-01-01T10:00:00.000Z",
    "updatedAt": "2024-01-01T11:00:00.000Z"
  },
  "success": true
}
```

### Error Responses

**400 Bad Request** - Invalid or missing name
```json
{
  "error": "Collection name is required as query parameter: ?name=CollectionName"
}
```

**404 Not Found** - Collection not found
```json
{
  "error": "Collection not found"
}
```

**409 Conflict** - Another collection with same name exists
```json
{
  "error": "A collection with this name already exists"
}
```

---

## 5. Delete Collection

Delete a collection and all its quotes.

### Request
```bash
curl -X DELETE "http://localhost:3000/api/collections?name=My Favorite Quotes"
```

### Windows PowerShell
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/collections?name=My Favorite Quotes" -Method DELETE
```

### Expected Response
```json
{
  "message": "Collection deleted successfully",
  "success": true
}
```

### Error Response

**400 Bad Request** - Missing name parameter
```json
{
  "error": "Collection name is required as query parameter: ?name=CollectionName"
}
```

**404 Not Found** - Collection not found
```json
{
  "error": "Collection not found"
}
```

---

## 6. Add Quote to Collection

Add a quote to a collection.

### Request
```bash
curl -X POST "http://localhost:3000/api/collections/quotes?name=My Favorite Quotes" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "The only way to do great work is to love what you do.",
    "author": "Steve Jobs"
  }'
```

### Windows PowerShell
```powershell
$body = @{
    text = "The only way to do great work is to love what you do."
    author = "Steve Jobs"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/collections/quotes?name=My Favorite Quotes" -Method POST -Body $body -ContentType "application/json"
```

### Expected Response
```json
{
  "quote": {
    "id": "quote-id-1",
    "text": "The only way to do great work is to love what you do.",
    "author": "Steve Jobs",
    "addedAt": "2024-01-01T12:00:00.000Z"
  },
  "collection": {
    "id": "1234567890-abc123",
    "name": "My Favorite Quotes",
    "quotes": [
      {
        "id": "quote-id-1",
        "text": "The only way to do great work is to love what you do.",
        "author": "Steve Jobs",
        "addedAt": "2024-01-01T12:00:00.000Z"
      }
    ],
    "createdAt": "2024-01-01T10:00:00.000Z"
  },
  "success": true
}
```

### Error Responses

**400 Bad Request** - Invalid or missing text/author
```json
{
  "error": "Quote text is required and must be a non-empty string"
}
```

**404 Not Found** - Collection not found
```json
{
  "error": "Collection not found"
}
```

**409 Conflict** - Quote already exists in collection
```json
{
  "error": "Quote already exists in this collection"
}
```

---

## 7. Remove Quote from Collection

Remove a quote from a collection.

### Request
```bash
curl -X DELETE "http://localhost:3000/api/collections/quotes/quote-id-1?name=My Favorite Quotes"
```

### Windows PowerShell
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/collections/quotes/quote-id-1?name=My Favorite Quotes" -Method DELETE
```

### Expected Response
```json
{
  "message": "Quote removed from collection successfully",
  "collection": {
    "id": "1234567890-abc123",
    "name": "My Favorite Quotes",
    "quotes": [],
    "createdAt": "2024-01-01T10:00:00.000Z"
  },
  "success": true
}
```

### Error Responses

**400 Bad Request** - Missing name parameter
```json
{
  "error": "Collection name is required as query parameter: ?name=CollectionName"
}
```

**404 Not Found** - Collection or quote not found
```json
{
  "error": "Collection not found"
}
```

or

```json
{
  "error": "Quote not found in collection"
}
```

---

## Complete Example Workflow

### 1. Create a collection
```bash
curl -X POST http://localhost:3000/api/collections \
  -H "Content-Type: application/json" \
  -d '{"name": "Motivational Quotes"}'
```

**Response:** Save the collection `name` from the response (e.g., `"Motivational Quotes"`)

### 2. Add quotes to the collection
```bash
curl -X POST "http://localhost:3000/api/collections/quotes?name=Motivational Quotes" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "The only way to do great work is to love what you do.",
    "author": "Steve Jobs"
  }'
```

### 3. Get the collection with quotes
```bash
curl -X GET "http://localhost:3000/api/collections?name=Motivational Quotes"
```

### 4. Update collection name
```bash
curl -X PUT "http://localhost:3000/api/collections?name=Motivational Quotes" \
  -H "Content-Type: application/json" \
  -d '{"name": "My Updated Collection"}'
```

### 5. Remove a quote from collection
```bash
curl -X DELETE "http://localhost:3000/api/collections/quotes/quote-id-1?name=Motivational Quotes"
```

### 6. Delete the collection
```bash
curl -X DELETE "http://localhost:3000/api/collections?name=Motivational Quotes"
```

---

## Notes

- All collection IDs are generated automatically and follow the format: `{timestamp}-{random-hex-string}` (used internally)
- Quote IDs within collections follow the same format
- Collection names must be unique (case-insensitive) and are used to identify collections in API endpoints
- **All endpoints use query parameters (`?name=...`) which automatically handle spaces and special characters - no URL encoding needed!**
- Quotes within a collection are identified by both text and author (duplicates are prevented)
- All timestamps are in ISO 8601 format
- Collection names are limited to 100 characters
- Quote text and author are required when adding quotes to collections
- Collection name matching is case-insensitive
- The query parameter approach is recommended as it's easier to use and doesn't require URL encoding

