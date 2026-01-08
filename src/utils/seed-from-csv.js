require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Models
const User = require('../models/User');
const Category = require('../models/Category');
const Item = require('../models/Item');
const Table = require('../models/Table');
const Settings = require('../models/Settings');
const connectDB = require('../config/db');

// Function to read CSV file
const readCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
};

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany();
    await Category.deleteMany();
    await Item.deleteMany();
    await Table.deleteMany();
    await Settings.deleteMany();

    // Create users
    console.log('Creating users...');
    const users = await User.create([
      {
        name: 'Admin User',
        username: 'admin',
        email: process.env.ADMIN_EMAIL || 'admin@restaurant.com',
        password: process.env.ADMIN_PASSWORD || 'admin123',
        role: 'admin'
      },
      {
        name: 'Cashier User',
        username: 'cashier',
        email: 'cashier@restaurant.com',
        password: 'cashier123',
        role: 'cashier'
      },
      {
        name: 'Waiter User',
        username: 'waiter',
        email: 'waiter@restaurant.com',
        password: 'waiter123',
        role: 'waiter'
      }
    ]);

    console.log('Users created:', users.length);

    // Read and create categories from CSV
    console.log('Reading categories from CSV...');
    const categoriesPath = path.join(__dirname, '../data/categories.csv');
    const categoriesData = await readCSV(categoriesPath);
    
    const categories = await Category.create(
      categoriesData.map(cat => ({
        name: cat.name,
        description: cat.description,
        isActive: cat.isActive === 'true',
        displayOrder: parseInt(cat.displayOrder)
      }))
    );

    console.log('Categories created:', categories.length);

    // Create a map of category names to IDs
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });

    // Read and create items from CSV
    console.log('Reading items from CSV...');
    const itemsPath = path.join(__dirname, '../data/items.csv');
    const itemsData = await readCSV(itemsPath);
    
    // Filter out empty rows
    const validItems = itemsData.filter(item => 
      item.name && item.name.trim() !== '' && item.category && item.category.trim() !== ''
    );
    
    const items = await Item.create(
      validItems.map(item => ({
        name: item.name,
        description: item.description,
        category: categoryMap[item.category],
        price: parseFloat(item.price),
        stock: parseInt(item.stock),
        threshold: parseInt(item.threshold),
        isVeg: item.isVeg === 'true',
        preparationTime: parseInt(item.preparationTime),
        tags: item.tags ? item.tags.split(',').map(tag => tag.trim()) : [],
        isAvailable: true
      }))
    );

    console.log('Menu items created:', items.length);

    // Create tables
    console.log('Creating tables...');
    const tables = [];
    for (let i = 1; i <= 11; i++) {
      const tableData = {
        tableNumber: i,
        name: `Table ${i}`,
        capacity: i <= 2 ? 2 : i <= 5 ? 4 : i <= 8 ? (i === 7 ? 8 : 2) : (i === 10 ? 6 : 4),
        status: 'available',
        location: i === 1 ? 'Window side' : 
                  i === 2 ? 'Center' : 
                  i === 3 ? 'Corner' : 
                  i === 4 ? 'Private room' : 
                  i === 5 ? 'Bar area' : 
                  i === 6 ? 'Patio' : 
                  i === 7 ? 'Family section' : 
                  i === 8 ? 'Window side' : 
                  i === 9 ? 'Center' : 
                  i === 10 ? 'VIP section' : 'Garden area',
        isActive: true
      };
      tables.push(tableData);
    }

    await Table.create(tables);
    console.log('Tables created:', tables.length);

    // Create settings
    console.log('Creating settings...');
    await Settings.create({
      restaurantName: 'Kora Restaurant',
      currency: 'INR',
      taxRate: 5,
      address: '123 Main Street, City',
      phone: '+91 1234567890',
      email: 'info@korarestaurant.com'
    });

    console.log('Settings created');
    console.log('\n✅ Database seeded successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Menu Items: ${items.length}`);
    console.log(`   - Tables: ${tables.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
