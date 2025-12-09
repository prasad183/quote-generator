# MongoDB Models Enhancements

This document describes all the enhancements made to the MongoDB models for better performance, validation, and data integrity.

## Enhancements Applied

### 1. **Auto-Updating Timestamps**
All models with `updatedAt` fields now automatically update on save:
- `QuoteAnalytics` - Auto-updates `updatedAt` on save
- `UserPreferences` - Auto-updates `updatedAt` on save
- `QuoteSubmission` - Auto-updates `updatedAt` and sets `createdAt` on new documents
- `Collection` - Auto-updates `updatedAt` and sets `createdAt` on new documents

### 2. **Additional Database Indexes**

#### QuoteAnalytics
- `viewCount: -1, favoriteCount: -1` - For sorting by popularity
- `lastViewedAt: 1` - For finding recently viewed quotes
- `createdAt: 1` - For chronological sorting

#### UserPreferences
- `updatedAt: 1` - For tracking preference changes

#### UserFavorites
- `userId: 1, favoritedAt: -1` - For sorting favorites by date
- `favoritedAt: 1` - For date-based queries

#### QuoteHistory
- `quoteId: 1, viewCount: -1` - For finding most viewed quotes
- Existing indexes maintained for user-specific queries

#### UserFollows
- `followerId: 1, followedAt: -1` - For sorting follows by date
- `followingId: 1, followedAt: -1` - For sorting followers by date

#### SearchHistory
- `query: 1, resultsCount: -1` - For finding popular search queries

#### QuoteSubmission
- `status: 1, submittedAt: -1` - For finding pending submissions efficiently
- `submittedBy: 1, submittedAt: -1` - For user submission history
- `updatedAt: 1` - For tracking updates

#### ApiUsage
- `endpoint: 1, method: 1, calledAt: -1` - For endpoint statistics
- `statusCode: 1, calledAt: -1` - For error tracking

#### Collection
- `isPublic: 1, createdAt: -1` - For finding public collections
- `userId: 1, createdAt: -1` - For user collection history

#### User
- `username: 1` - Explicit index (already unique)
- `lastActiveAt: -1` - For finding active users
- `createdAt: -1` - For finding recently registered users
- `email: 1` - For email lookups

### 3. **Data Validation**

#### QuoteAnalytics
- `viewCount`, `shareCount`, `copyCount`, `favoriteCount` - Minimum value of 0

#### QuoteHistory
- `viewCount` - Minimum value of 1

#### SearchHistory
- `resultsCount` - Minimum value of 0

#### ApiUsage
- `responseTime` - Minimum value of 0
- `statusCode` - Range validation (100-599)

#### User
- `email` - Email format validation (optional field)
- `totalQuotesViewed`, `totalFavorites`, `totalCollections` - Minimum value of 0

#### UserPreferences
- All enum fields properly validated
- Numeric fields have min/max constraints

### 4. **Pre-Save Hooks**

Models with pre-save hooks:
- **QuoteAnalytics**: Updates `updatedAt` automatically
- **UserPreferences**: Updates `updatedAt` automatically
- **QuoteSubmission**: Updates `updatedAt` and sets `createdAt` for new documents
- **Collection**: Updates `updatedAt` and sets `createdAt` for new documents

## Index Strategy Summary

### Single Field Indexes
- Primary keys and unique fields
- Frequently queried fields (userId, quoteId, etc.)
- Date fields for sorting (createdAt, updatedAt, etc.)

### Compound Indexes
- User + Date combinations for efficient user-specific queries
- Status + Date for filtering and sorting
- Endpoint + Method + Date for API analytics

### Unique Indexes
- Prevent duplicate data (favorites, follows, etc.)
- Ensure data integrity

## Performance Benefits

1. **Faster Queries**: Indexes on frequently queried fields reduce query time
2. **Efficient Sorting**: Indexes on date fields enable fast chronological sorting
3. **Better Filtering**: Compound indexes support complex filter queries
4. **Data Integrity**: Validation ensures data quality
5. **Automatic Updates**: Pre-save hooks maintain timestamp consistency

## Model-Specific Improvements

### QuoteAnalytics
- Popularity sorting index
- Auto-updating timestamps
- Count validation (min: 0)

### UserPreferences
- Auto-updating timestamps
- Indexed updatedAt for change tracking

### UserFavorites
- Date-based sorting index
- Duplicate prevention via unique compound index

### QuoteHistory
- Most viewed quotes index
- View count validation

### UserFollows
- Date-based sorting for both directions
- Self-follow prevention via unique index

### SearchHistory
- Popular queries index
- Results count validation

### QuoteSubmission
- Status-based filtering index
- User submission history index
- Auto-updating timestamps

### ApiUsage
- Endpoint statistics index
- Error tracking index
- Response time and status code validation

### Collection
- Public collection discovery index
- User collection history index
- Auto-updating timestamps

### User
- Email validation
- Activity tracking indexes
- Count field validation

## Database Collections

All models create the following MongoDB collections:
- `users` (enhanced)
- `quotes`
- `collections` (enhanced)
- `userpreferences` (new)
- `userfavorites` (new)
- `quotehistories` (new)
- `quoteanalytics` (new)
- `userfollows` (new)
- `searchhistories` (new)
- `quotesubmissions` (new)
- `apiusages` (new)

## Notes

- All indexes are created automatically when models are first used
- Pre-save hooks run automatically on document save
- Validation errors are thrown before saving invalid data
- Timestamps are maintained automatically without manual intervention
- All changes are backward compatible with existing data

