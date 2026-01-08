require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Order = require('../models/Order');

const migrateOrderStatus = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    console.log('Starting order status migration...');
    
    // Update all orders with 'paid' status to 'served'
    const result1 = await Order.updateMany(
      { status: 'paid' },
      { $set: { status: 'served' } }
    );
    
    console.log(`Updated ${result1.modifiedCount} orders from 'paid' to 'served'`);
    
    // Update all orders with 'completed' status to 'served'
    const result2 = await Order.updateMany(
      { status: 'completed' },
      { $set: { status: 'served' } }
    );
    
    console.log(`Updated ${result2.modifiedCount} orders from 'completed' to 'served'`);
    
    // Update all orders with 'accepted', 'preparing', or 'ready' status to 'pending'
    const result3 = await Order.updateMany(
      { status: { $in: ['accepted', 'preparing', 'ready'] } },
      { $set: { status: 'pending' } }
    );
    
    console.log(`Updated ${result3.modifiedCount} orders from old statuses to 'pending'`);
    
    // Verify the migration
    const orders = await Order.find({});
    const statusCounts = {};
    
    orders.forEach(order => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    });
    
    console.log('\nCurrent order status distribution:');
    console.log(statusCounts);
    
    console.log('\nMigration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateOrderStatus();
