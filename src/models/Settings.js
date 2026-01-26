const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  businessName: {
    type: String,
    required: true,
    trim: true,
    minlength: [2, 'Business name must be at least 2 characters'],
    maxlength: [100, 'Business name cannot exceed 100 characters'],
    default: 'My Business'
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email'],
    default: 'info@business.com'
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    default: ''
  },
  address: {
    type: String,
    required: true,
    minlength: [10, 'Address must be at least 10 characters'],
    default: ''
  },
  gstNumber: {
    type: String,
    trim: true,
    uppercase: true,
    match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST number format'],
    default: null
  },
  logo: {
    type: String,
    default: null
  },
  enableGst: {
    type: Boolean,
    default: false
  },
  sgstRate: {
    type: Number,
    min: [0, 'SGST rate cannot be negative'],
    max: [100, 'SGST rate cannot exceed 100'],
    default: 2.5
  },
  cgstRate: {
    type: Number,
    min: [0, 'CGST rate cannot be negative'],
    max: [100, 'CGST rate cannot exceed 100'],
    default: 2.5
  },
  planType: {
    type: String,
    enum: ['free', 'premium', 'enterprise'],
    default: 'free'
  },
  planValidity: {
    type: Date,
    default: null
  },
  // Legacy fields for backward compatibility
  cafeName: {
    type: String,
    default: 'My Café'
  },
  businessHours: {
    openingTime: {
      type: String,
      default: '08:00'
    },
    closingTime: {
      type: String,
      default: '22:00'
    }
  },
  tax: {
    gstRate: {
      type: Number,
      min: [0, 'GST rate cannot be negative'],
      max: [100, 'GST rate cannot exceed 100'],
      default: 5
    }
  },
  currency: {
    type: String,
    enum: ['INR', 'USD', 'EUR', 'GBP'],
    default: 'INR'
  },
  currencySymbol: {
    type: String,
    default: '₹'
  },
  isInitialized: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
settingsSchema.index({ userId: 1 }, { unique: true });
settingsSchema.index({ gstNumber: 1 });

// Ensure only one settings document exists (legacy method)
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({
      isInitialized: true
    });
  }
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);
