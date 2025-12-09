// User storage using MongoDB (or in-memory if disabled)
import crypto from 'crypto';
import connectDB, { isMongoEnabled } from './mongodb';

// In-memory user storage (fallback when MongoDB is disabled)
const inMemoryUsers = new Map();

// Hash password
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Create a new user
export async function createUser(name, username, password) {
  try {
    // Validate inputs
    if (!name || name.trim().length === 0) {
      return { success: false, error: 'Name is required' };
    }
    
    if (!username || username.trim().length === 0) {
      return { success: false, error: 'Username is required' };
    }
    
    if (username.trim().length < 3) {
      return { success: false, error: 'Username must be at least 3 characters' };
    }
    
    if (!password || password.length === 0) {
      return { success: false, error: 'Password is required' };
    }
    
    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    const usernameLower = username.trim().toLowerCase();
    
    // Check if MongoDB is enabled
    if (isMongoEnabled()) {
      try {
        await connectDB();
        const User = (await import('./models/User')).default;
        
        // Check if username already exists
        const existingUser = await User.findOne({ username: usernameLower });
        if (existingUser) {
          return { success: false, error: 'Username already exists' };
        }
        
        // Create new user
        const newUser = new User({
          name: name.trim(),
          username: usernameLower,
          password: hashPassword(password),
          createdAt: new Date(),
        });
        
        await newUser.save();
        
        return { 
          success: true, 
          user: { 
            id: newUser._id.toString(), 
            name: newUser.name, 
            username: newUser.username 
          } 
        };
      } catch (error) {
        console.error('Error creating user in MongoDB:', error);
        if (error.code === 11000) {
          return { success: false, error: 'Username already exists' };
        }
        // Fall through to in-memory storage
      }
    }
    
    // Use in-memory storage (MongoDB disabled or error)
    if (inMemoryUsers.has(usernameLower)) {
      return { success: false, error: 'Username already exists' };
    }
    
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    inMemoryUsers.set(usernameLower, {
      id: userId,
      name: name.trim(),
      username: usernameLower,
      password: hashPassword(password),
      createdAt: new Date(),
    });
    
    return { 
      success: true, 
      user: { 
        id: userId, 
        name: name.trim(), 
        username: usernameLower 
      } 
    };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, error: 'Failed to create user' };
  }
}

// Verify user credentials
export async function verifyUser(username, password) {
  try {
    const usernameLower = username.trim().toLowerCase();
    const hashedPassword = hashPassword(password);
    
    // Check if MongoDB is enabled
    if (isMongoEnabled()) {
      try {
        await connectDB();
        const User = (await import('./models/User')).default;
        
        const user = await User.findOne({ 
          username: usernameLower,
          password: hashedPassword
        });
        
        if (user) {
          return { 
            success: true, 
            user: { 
              id: user._id.toString(), 
              name: user.name, 
              username: user.username 
            } 
          };
        }
      } catch (error) {
        console.error('Error verifying user in MongoDB:', error);
        // Fall through to in-memory storage
      }
    }
    
    // Use in-memory storage (MongoDB disabled or error)
    const user = inMemoryUsers.get(usernameLower);
    if (user && user.password === hashedPassword) {
      return { 
        success: true, 
        user: { 
          id: user.id, 
          name: user.name, 
          username: user.username 
        } 
      };
    }
    
    return { success: false, error: 'Invalid username or password' };
  } catch (error) {
    console.error('Error verifying user:', error);
    return { success: false, error: 'Failed to verify user' };
  }
}

// Get user by ID
export async function getUserById(id) {
  try {
    // Check if MongoDB is enabled
    if (isMongoEnabled()) {
      try {
        await connectDB();
        const User = (await import('./models/User')).default;
        
        const user = await User.findById(id);
        
        if (user) {
          return { 
            success: true, 
            user: { 
              id: user._id.toString(), 
              name: user.name, 
              username: user.username 
            } 
          };
        }
      } catch (error) {
        console.error('Error getting user by ID from MongoDB:', error);
        // Fall through to in-memory storage
      }
    }
    
    // Use in-memory storage (MongoDB disabled or error)
    for (const [username, user] of inMemoryUsers.entries()) {
      if (user.id === id) {
        return { 
          success: true, 
          user: { 
            id: user.id, 
            name: user.name, 
            username: user.username 
          } 
        };
      }
    }
    
    return { success: false, error: 'User not found' };
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return { success: false, error: 'Failed to get user' };
  }
}

// Get user by username
export async function getUserByUsername(username) {
  try {
    const usernameLower = username.trim().toLowerCase();
    
    // Check if MongoDB is enabled
    if (isMongoEnabled()) {
      try {
        await connectDB();
        const User = (await import('./models/User')).default;
        
        const user = await User.findOne({ username: usernameLower });
        
        if (user) {
          return { 
            success: true, 
            user: { 
              id: user._id.toString(), 
              name: user.name, 
              username: user.username 
            } 
          };
        }
      } catch (error) {
        console.error('Error getting user by username from MongoDB:', error);
        // Fall through to in-memory storage
      }
    }
    
    // Use in-memory storage (MongoDB disabled or error)
    const user = inMemoryUsers.get(usernameLower);
    if (user) {
      return { 
        success: true, 
        user: { 
          id: user.id, 
          name: user.name, 
          username: user.username 
        } 
      };
    }
    
    return { success: false, error: 'User not found' };
  } catch (error) {
    console.error('Error getting user by username:', error);
    return { success: false, error: 'Failed to get user' };
  }
}

