# MongoDB Setup Guide

This project has been configured to use MongoDB for data storage. Follow these steps to set up MongoDB connection.

## Prerequisites

1. **Install MongoDB**: Make sure MongoDB is installed and running on your local machine.
   - Download from: https://www.mongodb.com/try/download/community
   - Default port: `27017`

## Setup Instructions

### 1. Create Environment File

Create a `.env.local` file in the root directory of the project with the following content:

```env
# MongoDB Connection String
MONGODB_URI=mongodb://localhost:27017/quote-generator
```

**Alternative connection strings** (if you have authentication enabled):

```env
# With authentication
MONGODB_URI=mongodb://username:password@localhost:27017/quote-generator?authSource=admin

# Remote MongoDB
MONGODB_URI=mongodb://your-remote-host:27017/quote-generator
```

### 2. Start MongoDB Service

**Windows:**
```bash
# Start MongoDB service
net start MongoDB

# Or if installed as a service, it should start automatically
```

**macOS (Homebrew):**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

### 3. Verify MongoDB is Running

Check if MongoDB is running on port 27017:

```bash
# Test connection
mongosh mongodb://localhost:27017

# Or use mongo command (older versions)
mongo --eval "db.adminCommand('ismaster')"
```

### 4. Install Dependencies

MongoDB dependencies have already been installed. If you need to reinstall:

```bash
npm install mongoose
```

### 5. Start the Next.js Application

```bash
npm run dev
```

## Database Structure

The application uses the following MongoDB collections:

### Collections:
- **users**: Stores user accounts
- **collections**: Stores quote collections
- **quotes**: Stores quote data (optional, if you migrate quotes from lib/quotes.js)

### Schema Details:

#### User Schema:
```javascript
{
  name: String,
  username: String (unique),
  password: String (hashed),
  createdAt: Date
}
```

#### Collection Schema:
```javascript
{
  name: String (unique),
  quotes: [{
    id: String,
    text: String,
    author: String,
    addedAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

## Migration from JSON Files

The application has been migrated from file-based storage (`data/users.json`, `data/collections.json`) to MongoDB. 

### Migration Options:

1. **Automatic Migration**: The application will create new records as users interact with it.

2. **Manual Migration**: If you have existing data in JSON files, you can write a migration script to import them into MongoDB.

## Troubleshooting

### Connection Issues

1. **MongoDB not running**:
   - Check if MongoDB service is running: `mongosh --eval "db.adminCommand('ismaster')"`
   - Start MongoDB service if not running

2. **Connection refused**:
   - Verify MongoDB is listening on port 27017
   - Check firewall settings
   - Ensure MONGODB_URI is correct in `.env.local`

3. **Authentication failed**:
   - If MongoDB requires authentication, update MONGODB_URI with credentials
   - Format: `mongodb://username:password@localhost:27017/quote-generator?authSource=admin`

### Common Errors

- **"MongoServerError: bad auth"**: Authentication credentials are incorrect
- **"ECONNREFUSED"**: MongoDB service is not running
- **"MongooseError: Operation `users.insertOne()` buffering timed out"**: MongoDB connection failed

## Database Location

By default, MongoDB stores data in:
- **Windows**: `C:\Program Files\MongoDB\Server\{version}\data\db`
- **macOS**: `/usr/local/var/mongodb`
- **Linux**: `/var/lib/mongodb`

## Backing Up Data

To backup your MongoDB database:

```bash
mongodump --db quote-generator --out /path/to/backup
```

To restore:

```bash
mongorestore --db quote-generator /path/to/backup/quote-generator
```

## Next Steps

1. Create `.env.local` file with MongoDB connection string
2. Ensure MongoDB is running
3. Start your Next.js application
4. Test user registration/login to verify MongoDB connection

## Support

For MongoDB-related issues:
- MongoDB Documentation: https://docs.mongodb.com/
- Mongoose Documentation: https://mongoosejs.com/docs/

