import mongoose from 'mongoose';
import dotenv from 'dotenv';
import config from '../src/config/config.js';
import { createDefaultSuperAdmin } from '../src/services/admin.service.js';

// Load environment variables
dotenv.config();

/**
 * Script to create default super admin
 * Usage: node scripts/createDefaultAdmin.js
 */
const createDefaultAdmin = async () => {
  try {
    // Set default NODE_ENV if not provided
    if (!process.env.NODE_ENV) {
      process.env.NODE_ENV = 'development';
    }
    
    // Connect to MongoDB
    await mongoose.connect(config.mongoose.url, config.mongoose.options);
    console.log('Connected to MongoDB');

    // Create default super admin
    const admin = await createDefaultSuperAdmin();
    
    console.log('Default admin details:');
    console.log(`Email: ${admin.email}`);
    console.log(`Name: ${admin.name}`);
    console.log(`Role: ${admin.roleName}`);
    console.log(`Active: ${admin.isActive}`);
    console.log('Permissions:', admin.getEnabledPermissions());
    
    console.log('\n✅ Default super admin created successfully!');
    console.log('You can now login with:');
    console.log('Email: admin@zuhaush.in');
    console.log('Password: admin@1234');
    
  } catch (error) {
    console.error('❌ Error creating default admin:', error.message);
    process.exit(1);
  } finally {
    // Close MongoDB connection
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  }
};

// Run the script
createDefaultAdmin();
