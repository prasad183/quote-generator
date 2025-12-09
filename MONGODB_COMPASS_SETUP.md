# MongoDB Compass - Viewing New Collections and Fields

This guide explains how to see all the new MongoDB collections and fields in MongoDB Compass.

## Step 1: Run the Migration Endpoint

To update existing documents and ensure all new collections are visible in MongoDB Compass, call the migration API:

### Using cURL:
```bash
curl -X POST http://localhost:3000/api/migrate/database
```

### Using Browser:
Open: `http://localhost:3000/api/migrate/database` (POST request)

### Using Postman or Thunder Client:
- Method: POST
- URL: `http://localhost:3000/api/migrate/database`
- No body required

## Step 1.5: Force Update All Documents (If Fields Not Visible)

**If you see columns created but data not updated in MongoDB Compass**, run the force update endpoint:

### Using cURL:
```bash
curl -X POST http://localhost:3000/api/migrate/force-update
```

### Using Browser:
Open: `http://localhost:3000/api/migrate/force-update` (POST request)

This will:
- Update ALL existing User documents with new fields
- Update ALL existing Collection documents with new fields
- Set default values (empty strings for optional fields, 0 for numbers)
- Ensure all fields are visible in MongoDB Compass

**Important:** After running this, refresh MongoDB Compass and click on individual documents to see all fields.

## Step 1.5: Create Sample Documents (Optional but Recommended)

To see sample data in all new collections immediately in MongoDB Compass:

### Using cURL:
```bash
curl -X POST http://localhost:3000/api/migrate/create-samples
```

### Using Browser:
Open: `http://localhost:3000/api/migrate/create-samples` (POST request)

**Note:** This requires at least one user to exist in the database. If you don't have users yet, create one through the registration page first.

This will create sample documents in:
- `userpreferences`
- `userfavorites`
- `quotehistories`
- `quoteanalytics`
- `userfollows` (if you have at least 2 users)
- `searchhistories`
- `quotesubmissions`
- `apiusages`

## Step 2: Check Database Status

To see what collections exist and their document counts:

### Using cURL:
```bash
curl http://localhost:3000/api/migrate/database
```

### Using Browser:
Open: `http://localhost:3000/api/migrate/database` (GET request)

This will show you:
- All collections (existing and new)
- Document count for each collection
- Available fields in each collection
- Indexed fields

## Step 3: View in MongoDB Compass

After running the migration:

1. **Open MongoDB Compass**
2. **Connect to your database** (usually `mongodb://localhost:27017/quote-generator`)
3. **Refresh the database view** (click the refresh button)
4. **You should now see all collections:**

### Existing Collections (Updated):
- `users` - Now includes: email, avatar, bio, location, website, socialLinks, lastLoginAt, lastActiveAt, totalQuotesViewed, totalFavorites, totalCollections
- `quotes` - Existing collection
- `collections` - Now includes: userId, isPublic

### New Collections (Created):
- `userpreferences` - User settings and preferences
- `userfavorites` - User favorite quotes
- `quotehistories` - Quote viewing history
- `quoteanalytics` - Quote engagement metrics
- `userfollows` - User follow relationships
- `searchhistories` - Search query history
- `quotesubmissions` - Quote submission queue
- `apiusages` - API usage tracking

## Step 4: View Document Structure

To see the field structure in MongoDB Compass:

1. Click on any collection name
2. If the collection has documents, click on a document to see its structure
3. If the collection is empty, you can see the schema by:
   - Looking at the model files in `lib/models/`
   - Or creating a test document via the API

## Understanding the Collections

### Collections That May Be Empty Initially:

These collections will be empty until data is created through API calls:
- `userpreferences` - Created when user first accesses preferences
- `userfavorites` - Created when user adds favorites
- `quotehistories` - Created when user views quotes
- `quoteanalytics` - Created when quotes are interacted with
- `userfollows` - Created when users follow each other
- `searchhistories` - Created when users search
- `quotesubmissions` - Created when quotes are submitted
- `apiusages` - Created when API endpoints are called

### To See Sample Data:

1. **Use the application** - Interact with the app to create data
2. **Call the APIs directly** - Use Postman/Thunder Client to create test data
3. **Check the API documentation** - See `ADDITIONAL_DATA_STORAGE.md` for API examples

## Troubleshooting

### Collections Not Showing in Compass:

1. **Refresh MongoDB Compass** - Click the refresh button
2. **Check database name** - Ensure you're connected to the correct database
3. **Run migration again** - Call POST `/api/migrate/database`
4. **Check connection** - Verify MongoDB is running and accessible

### Fields Not Showing in Documents:

1. **MongoDB Compass Schema View** - The schema view might not show fields with null/empty values
2. **Solution:** Click on individual documents (not just the schema view) to see all fields
3. **Run force update** - Use `/api/migrate/force-update` to ensure all documents have the new fields
4. **Check document directly** - In Compass, click on a document to see all its fields, even if they're empty

### If Columns Created But Data Not Updated:

1. **Run force update endpoint:**
   ```bash
   curl -X POST http://localhost:3000/api/migrate/force-update
   ```

2. **Refresh MongoDB Compass** - Click the refresh button

3. **View documents directly** - Click on a document in the collection to see all fields

4. **Check verification** - The force-update endpoint returns verification showing which fields exist

### To Update Existing Documents:

The migration endpoint automatically:
- Adds new fields to existing User documents with default values
- Adds new fields to existing Collection documents with default values
- Creates all necessary indexes

## Quick Test

To quickly see all collections with data structure:

1. Run: `GET http://localhost:3000/api/migrate/database`
2. This shows all collections, their document counts, and available fields
3. Use this to verify everything is set up correctly

## Next Steps

After migration:
1. Use the application normally - data will be created automatically
2. Check MongoDB Compass periodically to see new data
3. Use the GET endpoint to check collection status anytime

