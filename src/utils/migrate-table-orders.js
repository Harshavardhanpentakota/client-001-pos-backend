require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Table = require('../models/Table');
const Order = require('../models/Order');

const migrateTableOrders = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    console.log('Starting table orders migration...');
    
    // Get all tables
    const tables = await Table.find({});
    
    for (const table of tables) {
      const updates = {};
      
      // Initialize currentOrders array if it doesn't exist
      if (!table.currentOrders) {
        updates.currentOrders = [];
      }
      
      // If table has a currentOrder, add it to currentOrders array
      if (table.currentOrder) {
        // Find all pending orders for this table
        const pendingOrders = await Order.find({
          table: table._id,
          status: { $in: ['pending'] }
        });
        
        if (pendingOrders.length > 0) {
          updates.currentOrders = pendingOrders.map(o => o._id);
          console.log(`Table ${table.tableNumber}: Added ${pendingOrders.length} pending orders to currentOrders`);
        } else if (table.currentOrder) {
          // Just add the current order
          updates.currentOrders = [table.currentOrder];
          console.log(`Table ${table.tableNumber}: Added currentOrder to currentOrders array`);
        }
      }
      
      // Apply updates if any
      if (Object.keys(updates).length > 0) {
        await Table.findByIdAndUpdate(table._id, updates);
      }
    }
    
    // Verify the migration
    const updatedTables = await Table.find({}).populate('currentOrders');
    console.log('\nMigration Summary:');
    updatedTables.forEach(table => {
      console.log(`Table ${table.tableNumber}: ${table.currentOrders.length} orders`);
    });
    
    console.log('\nMigration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateTableOrders();
