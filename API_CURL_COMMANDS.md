# API Endpoints - cURL Commands

Base URL: `http://localhost:3000`

---

## 1. GET /api/quote - Get Random Quote

Get a random quote from the collection.

### Basic Request
```bash
curl http://localhost:3000/api/quote
```

### With Author Filter
```bash
curl "http://localhost:3000/api/quote?author=Steve%20Jobs"
```

### With Category Filter
```bash
curl "http://localhost:3000/api/quote?category=motivation"
```

### With Both Author and Category Filters
```bash
curl "http://localhost:3000/api/quote?author=Steve%20Jobs&category=motivation"
```

---

## 2. GET /api/quotes - Get All Quotes (with Pagination & Filtering)

Get all quotes with pagination, filtering, and search capabilities.

### Basic Request (First Page, 10 quotes)
```bash
curl http://localhost:3000/api/quotes
```

### With Pagination
```bash
curl "http://localhost:3000/api/quotes?page=1&limit=20"
```

### Filter by Author
```bash
curl "http://localhost:3000/api/quotes?author=Steve%20Jobs"
```

### Filter by Category
```bash
curl "http://localhost:3000/api/quotes?category=motivation"
```

### Search in All Fields
```bash
curl "http://localhost:3000/api/quotes?search=success"
```

### Combined Filters with Pagination
```bash
curl "http://localhost:3000/api/quotes?page=1&limit=5&author=Steve%20Jobs&category=motivation"
```

---

## 3. POST /api/quotes - Add New Quote

Submit a new quote to the collection.

### Basic Request
```bash
curl -X POST http://localhost:3000/api/quotes \
  -H "Content-Type: application/json" \
  -d "{\"text\":\"Your inspiring quote here\",\"author\":\"Author Name\",\"category\":\"motivation\"}"
```

### With All Fields
```bash
curl -X POST http://localhost:3000/api/quotes \
  -H "Content-Type: application/json" \
  -d "{\"text\":\"The only way to do great work is to love what you do.\",\"author\":\"Steve Jobs\",\"category\":\"motivation\"}"
```

### Minimal Request (category defaults to "general")
```bash
curl -X POST http://localhost:3000/api/quotes \
  -H "Content-Type: application/json" \
  -d "{\"text\":\"Life is beautiful\",\"author\":\"Unknown\"}"
```

---

## 4. GET /api/quotes/search - Search Quotes

Advanced search with relevance scoring and field-specific search.

### Basic Search (All Fields)
```bash
curl "http://localhost:3000/api/quotes/search?q=success"
```

### Search with Pagination
```bash
curl "http://localhost:3000/api/quotes/search?q=success&page=1&limit=10"
```

### Search in Text Only
```bash
curl "http://localhost:3000/api/quotes/search?q=work&field=text"
```

### Search in Author Only
```bash
curl "http://localhost:3000/api/quotes/search?q=Jobs&field=author"
```

### Search in Category Only
```bash
curl "http://localhost:3000/api/quotes/search?q=motivation&field=category"
```

### Search All Fields with Pagination
```bash
curl "http://localhost:3000/api/quotes/search?q=inspire&field=all&page=1&limit=20"
```

---

## 5. GET /api/quotes/[id] - Get Quote by ID

Get a specific quote by its ID.

### Get Quote with ID 1
```bash
curl http://localhost:3000/api/quotes/1
```

### Get Quote with ID 5
```bash
curl http://localhost:3000/api/quotes/5
```

### Get Quote with ID 10
```bash
curl http://localhost:3000/api/quotes/10
```

---

## 6. GET /api/authors - Get All Authors

Get all unique authors with their quote counts and categories.

### Basic Request
```bash
curl http://localhost:3000/api/authors
```

**Response includes:**
- List of all authors
- Quote count per author
- Categories each author has quotes in
- Total authors count
- Total quotes count

---

## 7. GET /api/stats - Get App Statistics

Get comprehensive statistics about the quote collection.

### Basic Request
```bash
curl http://localhost:3000/api/stats
```

**Response includes:**
- Overview: total quotes, authors, categories, average quote length, total words, average words per quote
- Category breakdown with counts
- Top 5 authors by quote count
- Longest and shortest quotes
- Complete list of authors and categories

---

## Example Responses

### Random Quote Response
```json
{
  "quote": "The best way to get started is to quit talking and begin doing. – Walt Disney",
  "data": {
    "id": 1,
    "text": "The best way to get started is to quit talking and begin doing.",
    "author": "Walt Disney",
    "category": "motivation"
  }
}
```

### All Quotes Response (Paginated)
```json
{
  "quotes": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "totalPages": 2,
    "hasNextPage": true,
    "hasPreviousPage": false
  },
  "filters": {}
}
```

### Search Results Response
```json
{
  "query": "success",
  "field": "all",
  "results": [...],
  "count": 5,
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  },
  "searchInfo": {
    "terms": ["success"],
    "totalMatches": 5
  }
}
```

### Authors Response
```json
{
  "authors": [
    {
      "name": "Steve Jobs",
      "quoteCount": 3,
      "categories": ["motivation", "leadership"]
    }
  ],
  "total": 12,
  "totalQuotes": 15
}
```

### Statistics Response
```json
{
  "overview": {
    "totalQuotes": 15,
    "totalAuthors": 12,
    "totalCategories": 7,
    "averageQuoteLength": 85,
    "totalWords": 245,
    "averageWordsPerQuote": 16
  },
  "categoryBreakdown": [...],
  "topAuthors": [...],
  "quoteLengths": {
    "longest": {...},
    "shortest": {...}
  }
}
```

---

## Notes

- All endpoints return JSON responses
- Pagination: `page` starts at 1, `limit` can be 1-100
- Search is case-insensitive
- Category values: `motivation`, `wisdom`, `perseverance`, `success`, `leadership`, `inspiration`, `general`
- Quote IDs are numeric and start from 1
- POST requests require `Content-Type: application/json` header

