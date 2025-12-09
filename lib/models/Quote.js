import mongoose from 'mongoose';

const QuoteSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
  },
  author: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  category: {
    type: String,
    required: true,
    enum: ['motivation', 'wisdom', 'perseverance', 'success', 'leadership', 'inspiration', 'general'],
    default: 'general',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: false,
});

// Prevent re-compilation during hot reload in development
const Quote = mongoose.models.Quote || mongoose.model('Quote', QuoteSchema);

export default Quote;

