// MongoDB is disabled - connection function returns without connecting
// To re-enable MongoDB, set ENABLE_MONGODB=true in your environment variables

// Check environment variable dynamically each time
function checkMongoEnabled() {
  return process.env.ENABLE_MONGODB === 'true';
}

let isMongoDBEnabled = checkMongoEnabled();

async function connectDB() {
  // Check dynamically each time
  isMongoDBEnabled = checkMongoEnabled();
  
  if (!isMongoDBEnabled) {
    // MongoDB is disabled - return a mock connection object
    console.log('⚠️ MongoDB is disabled. Using static data only.');
    return null;
  }

  // MongoDB is enabled - attempt to connect
  try {
    const mongoose = await import('mongoose');
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quote-generator';

    if (!MONGODB_URI) {
      console.warn('⚠️ MONGODB_URI not set. MongoDB is disabled.');
      isMongoDBEnabled = false;
      return null;
    }

    /**
     * Global is used here to maintain a cached connection across hot reloads
     * in development. This prevents connections growing exponentially
     * during API Route usage.
     */
    let cached = global.mongoose;

    if (!cached) {
      cached = global.mongoose = { conn: null, promise: null };
    }

    if (cached.conn) {
      return cached.conn;
    }

    if (!cached.promise) {
      const opts = {
        bufferCommands: false,
      };

      cached.promise = mongoose.default.connect(MONGODB_URI, opts).then((mongoose) => {
        console.log('✅ MongoDB Connected Successfully');
        return mongoose;
      }).catch((error) => {
        console.error('❌ MongoDB Connection Error:', error);
        console.warn('⚠️ Falling back to static data mode.');
        isMongoDBEnabled = false;
        return null;
      });
    }

    try {
      cached.conn = await cached.promise;
    } catch (e) {
      cached.promise = null;
      isMongoDBEnabled = false;
      return null;
    }

    return cached.conn;
  } catch (error) {
    console.warn('⚠️ MongoDB module not available. Using static data only.');
    isMongoDBEnabled = false;
    return null;
  }
}

// Export a function to check if MongoDB is enabled
export function isMongoEnabled() {
  // Check dynamically each time
  isMongoDBEnabled = checkMongoEnabled();
  return isMongoDBEnabled;
}

export default connectDB;

