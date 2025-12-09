# Additional Data Storage Implementation

This document describes the additional MongoDB storage features that have been implemented without changing existing APIs or UI.

## New Models Created

### 1. UserPreferences (`lib/models/UserPreferences.js`)
Stores user-specific settings and preferences:
- `paletteKey` - Color palette preference (vibrant, twilight, sunrise)
- `themeMode` - Dark/light theme
- `fontSize` - Reading font size (16-38)
- `readingMode` - Focus mode toggle
- `language` - Preferred language (en, es, fr, de, hi, zh, te)
- `autoPlay` - Auto-play enabled/disabled
- `autoPlaySeconds` - Auto-play interval
- `isThemeFixed` - Theme fixed toggle

**API Endpoint:** `/api/user/preferences`
- GET - Retrieve user preferences
- PUT - Update user preferences

### 2. UserFavorites (`lib/models/UserFavorites.js`)
Stores user's favorite quotes:
- `userId` - Reference to user
- `quoteId` - Quote ID
- `text` - Quote text
- `author` - Quote author
- `category` - Quote category
- `favoritedAt` - Timestamp

**API Endpoint:** `/api/user/favorites`
- GET - Get user favorites (with pagination)
- POST - Add favorite
- DELETE - Remove favorite

### 3. QuoteHistory (`lib/models/QuoteHistory.js`)
Tracks quote viewing history per user:
- `userId` - Reference to user
- `quoteId` - Quote ID
- `text` - Quote text
- `author` - Quote author
- `category` - Quote category
- `viewedAt` - View timestamp
- `viewCount` - Number of times viewed

**API Endpoint:** `/api/user/history`
- GET - Get viewing history (with pagination)
- POST - Add/update quote in history
- DELETE - Clear history

### 4. QuoteAnalytics (`lib/models/QuoteAnalytics.js`)
Tracks engagement metrics for quotes:
- `quoteId` - Quote ID (unique)
- `viewCount` - Total views
- `shareCount` - Total shares
- `copyCount` - Total copies
- `favoriteCount` - Total favorites
- `lastViewedAt` - Last view timestamp

**API Endpoint:** `/api/analytics/quotes`
- GET - Get analytics (specific quote or all with pagination)
- POST - Increment analytics counter (view, share, copy, favorite)

### 5. UserFollows (`lib/models/UserFollows.js`)
Manages user follow relationships:
- `followerId` - User who is following
- `followingId` - User being followed
- `followedAt` - Follow timestamp

**API Endpoint:** `/api/user/follows`
- GET - Get follows/followers (type=following or type=followers)
- POST - Follow a user
- DELETE - Unfollow a user

### 6. SearchHistory (`lib/models/SearchHistory.js`)
Tracks user search queries:
- `userId` - Reference to user
- `query` - Search query text
- `searchField` - Search field (all, text, author, category)
- `resultsCount` - Number of results
- `searchedAt` - Search timestamp

**API Endpoint:** `/api/user/search-history`
- GET - Get search history (with pagination)
- POST - Add search to history
- DELETE - Clear search history

### 7. QuoteSubmission (`lib/models/QuoteSubmission.js`)
Manages quote submission queue for moderation:
- `text` - Quote text
- `author` - Quote author
- `category` - Quote category
- `submittedBy` - User who submitted (optional)
- `status` - pending, approved, rejected
- `reviewedBy` - Admin who reviewed
- `reviewedAt` - Review timestamp
- `rejectionReason` - Reason if rejected

**API Endpoint:** `/api/submissions`
- GET - Get submissions (with status filter and pagination)
- POST - Submit quote for review
- PUT - Review submission (approve/reject)

### 8. ApiUsage (`lib/models/ApiUsage.js`)
Tracks API usage statistics:
- `userId` - User who made the call (optional)
- `endpoint` - API endpoint
- `method` - HTTP method
- `responseTime` - Response time in milliseconds
- `statusCode` - HTTP status code
- `calledAt` - Call timestamp

**API Endpoint:** `/api/usage`
- GET - Get API usage statistics (with filters)
- POST - Log API usage

## Updated Models

### User Model (`lib/models/User.js`)
Enhanced with additional profile fields:
- `email` - Email address
- `avatar` - Profile picture URL
- `bio` - User biography
- `location` - User location
- `website` - Personal website
- `socialLinks` - Social media links (twitter, linkedin, github)
- `lastLoginAt` - Last login timestamp
- `lastActiveAt` - Last activity timestamp
- `totalQuotesViewed` - Total quotes viewed count
- `totalFavorites` - Total favorites count
- `totalCollections` - Total collections count

### Collection Model (`lib/models/Collection.js`)
Updated to support user-specific collections:
- `userId` - Reference to user (optional, for backward compatibility)
- `isPublic` - Public/private collection flag
- Compound index on `userId` and `name` for unique user collections

**Note:** Existing collections will have `userId: null` for backward compatibility.

## Helper Functions

### `lib/auth-helpers.js`
Created helper function `getAuthenticatedUser()` that:
- Extracts user from session cookie
- Verifies user exists
- Returns user object and MongoDB ObjectId for database operations

## API Usage Examples

### User Preferences
```javascript
// Get preferences
GET /api/user/preferences

// Update preferences
PUT /api/user/preferences
Body: { paletteKey: "vibrant", fontSize: 24, language: "en" }
```

### User Favorites
```javascript
// Get favorites
GET /api/user/favorites?page=1&limit=20

// Add favorite
POST /api/user/favorites
Body: { quoteId: 1, text: "Quote text", author: "Author", category: "motivation" }

// Remove favorite
DELETE /api/user/favorites?quoteId=1
```

### Quote History
```javascript
// Get history
GET /api/user/history?page=1&limit=50

// Add to history
POST /api/user/history
Body: { quoteId: 1, text: "Quote text", author: "Author", category: "motivation" }

// Clear history
DELETE /api/user/history
```

### Quote Analytics
```javascript
// Get analytics for specific quote
GET /api/analytics/quotes?quoteId=1

// Get all analytics
GET /api/analytics/quotes?page=1&limit=50

// Increment counter
POST /api/analytics/quotes
Body: { quoteId: 1, action: "view" } // or "share", "copy", "favorite"
```

### User Follows
```javascript
// Get following
GET /api/user/follows?type=following

// Get followers
GET /api/user/follows?type=followers

// Follow user
POST /api/user/follows
Body: { followingId: "user_id" }

// Unfollow user
DELETE /api/user/follows?followingId=user_id
```

### Search History
```javascript
// Get search history
GET /api/user/search-history?page=1&limit=50

// Add search
POST /api/user/search-history
Body: { query: "success", searchField: "all", resultsCount: 10 }

// Clear history
DELETE /api/user/search-history
```

### Quote Submissions
```javascript
// Get submissions
GET /api/submissions?status=pending&page=1&limit=50

// Submit quote
POST /api/submissions
Body: { text: "Quote text", author: "Author", category: "motivation" }

// Review submission
PUT /api/submissions
Body: { submissionId: "id", status: "approved" } // or "rejected"
```

### API Usage
```javascript
// Get usage stats
GET /api/usage?endpoint=/api/quotes&startDate=2024-01-01

// Log usage
POST /api/usage
Body: { endpoint: "/api/quotes", method: "GET", responseTime: 150, statusCode: 200 }
```

## Notes

1. **Backward Compatibility**: All existing APIs remain unchanged and functional.
2. **Authentication**: Most new endpoints require authentication via session cookie.
3. **Pagination**: List endpoints support pagination with `page` and `limit` query parameters.
4. **Error Handling**: All endpoints include proper error handling and validation.
5. **Database Indexes**: Appropriate indexes have been added for efficient queries.

## Database Collections

The following MongoDB collections are now available:
- `userpreferences`
- `userfavorites`
- `quotehistories`
- `quoteanalytics`
- `userfollows`
- `searchhistories`
- `quotesubmissions`
- `apiusages`

Plus updated:
- `users` (with new fields)
- `collections` (with userId support)

