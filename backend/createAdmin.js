import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

async function createAdminUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'adminhansika@gmail.com' });
    if (adminExists) {
      console.log('Admin user already exists!');
      await mongoose.connection.close();
      return;
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash('Adminhansika', 10);

    // Create admin user
    const admin = await User.create({
      name: 'Admin Hansika',
      email: 'adminhansika@gmail.com',
      password: hashedPassword,
      role: 'admin',
      isBlocked: false,
      certifiedTutor: false,
      bio: 'Administrator',
      teachingSubjects: [],
      certifiedSubjects: []
    });

    console.log('✅ Admin user created successfully!');
    console.log('Email:', admin.email);
    console.log('Password: Adminhansika');

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();
