require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Table = require('../models/Table');
const Order = require('../models/Order'); // Need to import Order for populate

const removeCurrentOrderField = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    console.log('Removing currentOrder field from tables...');
    
    // Remove currentOrder field from all tables
    const result = await Table.updateMany(
      {},
      { $unset: { currentOrder: "" } }
    );
    
    console.log(`Updated ${result.modifiedCount} tables`);
    
    // Verify the migration
    const tables = await Table.find({}).populate('currentOrders');
    console.log('\nTable summary:');
    tables.forEach(table => {
      console.log(`Table ${table.tableNumber}: ${table.currentOrders.length} orders, status: ${table.status}`);
    });
    
    console.log('\nMigration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

removeCurrentOrderField();
