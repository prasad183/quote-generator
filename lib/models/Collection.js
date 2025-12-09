import mongoose from 'mongoose';

const QuoteSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
    trim: true,
  },
  author: {
    type: String,
    required: true,
    trim: true,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  _id: false, // Don't create separate _id for nested quotes
});

const CollectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  quotes: {
    type: [QuoteSchema],
    default: [],
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Note: Removed pre-save hook to avoid "next is not a function" error
// Dates are set manually in the API routes

// Compound index for user-specific collections
// Use sparse: true so the unique constraint only applies when userId is not null
// This allows multiple collections with the same name when userId is null
CollectionSchema.index({ userId: 1, name: 1 }, { unique: true, sparse: true });
// Index for public collections
CollectionSchema.index({ isPublic: 1, createdAt: -1 });
// Index for user collections
CollectionSchema.index({ userId: 1, createdAt: -1 });

// Helper function to convert MongoDB document to API format
CollectionSchema.methods.toAPIFormat = function() {
  const formatDate = (date) => {
    if (!date) return new Date().toISOString();
    return date instanceof Date ? date.toISOString() : new Date(date).toISOString();
  };

  return {
    id: this._id ? this._id.toString() : '',
    name: this.name || '',
    userId: this.userId ? this.userId.toString() : null,
    isPublic: this.isPublic || false,
    quotes: (this.quotes || []).map(q => ({
      id: q.id || '',
      text: q.text || '',
      author: q.author || '',
      addedAt: formatDate(q.addedAt),
    })),
    createdAt: formatDate(this.createdAt),
    updatedAt: formatDate(this.updatedAt),
  };
};

// Prevent re-compilation during hot reload in development
const Collection = mongoose.models.Collection || mongoose.model('Collection', CollectionSchema);

export default Collection;
