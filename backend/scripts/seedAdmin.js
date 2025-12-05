import dotenv from 'dotenv';
import db from '../config/database.config.js';
import bcrypt from 'bcryptjs';

dotenv.config();
const User = db.model.User;

const seedAdmin = async () => {
  try {
    await db.connectToDatabase();
    console.log('Connected to database');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('Admin user already exists with email: admin@example.com');
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin@123456', salt);

    // Create admin user
    const adminUser = new User({
      f_name: 'Admin',
      l_name: 'User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      isVerified: true,
      cartItems: [],
    });

    await adminUser.save();
    console.log('✓ Admin user created successfully!');
    console.log('Email: admin@example.com');
    console.log('Password: Admin@123456');
    console.log('\nUse these credentials to log in.');

    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin:', err.message);
    process.exit(1);
  }
};

seedAdmin();
