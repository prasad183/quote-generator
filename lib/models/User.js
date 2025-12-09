import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    minlength: 3,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, {
  timestamps: false, // We'll use createdAt manually
});

// Index for finding recently registered users
UserSchema.index({ createdAt: -1 });

// Prevent re-compilation during hot reload in development
const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;

