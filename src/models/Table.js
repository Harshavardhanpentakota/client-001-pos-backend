const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  tableNumber: {
    type: Number,
    required: [true, 'Please provide a table number'],
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Please provide a table name'],
    trim: true
  },
  capacity: {
    type: Number,
    required: [true, 'Please provide table capacity'],
    min: 1,
    default: 4
  },
  status: {
    type: String,
    enum: ['available', 'unavailable', 'occupied'],
    default: 'available'
  },
  currentOrders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  qrCode: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    trim: true,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Ensure capacity is set (schema default handles this now)
tableSchema.pre('save', function(next) {
  next();
});

module.exports = mongoose.model('Table', tableSchema);
