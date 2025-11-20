// User storage - In production, this would be a database
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const usersFilePath = path.join(process.cwd(), 'data', 'users.json');

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize users file if it doesn't exist
if (!fs.existsSync(usersFilePath)) {
  fs.writeFileSync(usersFilePath, JSON.stringify([], null, 2));
}

// Read users from file
function readUsers() {
  try {
    const data = fs.readFileSync(usersFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Write users to file
function writeUsers(users) {
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing users:', error);
    return false;
  }
}

// Hash password
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Create a new user
export function createUser(name, username, password) {
  const users = readUsers();
  
  // Check if username already exists
  if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
    return { success: false, error: 'Username already exists' };
  }
  
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
  
  // Create new user
  const newUser = {
    id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
    name: name.trim(),
    username: username.trim().toLowerCase(),
    password: hashPassword(password),
    createdAt: new Date().toISOString(),
  };
  
  users.push(newUser);
  
  if (writeUsers(users)) {
    return { success: true, user: { id: newUser.id, name: newUser.name, username: newUser.username } };
  } else {
    return { success: false, error: 'Failed to save user' };
  }
}

// Verify user credentials
export function verifyUser(username, password) {
  const users = readUsers();
  const hashedPassword = hashPassword(password);
  
  const user = users.find(
    u => u.username.toLowerCase() === username.toLowerCase() && u.password === hashedPassword
  );
  
  if (user) {
    return { success: true, user: { id: user.id, name: user.name, username: user.username } };
  } else {
    return { success: false, error: 'Invalid username or password' };
  }
}

// Get user by ID
export function getUserById(id) {
  const users = readUsers();
  const user = users.find(u => u.id === id);
  
  if (user) {
    return { success: true, user: { id: user.id, name: user.name, username: user.username } };
  } else {
    return { success: false, error: 'User not found' };
  }
}

// Get user by username
export function getUserByUsername(username) {
  const users = readUsers();
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  
  if (user) {
    return { success: true, user: { id: user.id, name: user.name, username: user.username } };
  } else {
    return { success: false, error: 'User not found' };
  }
}

