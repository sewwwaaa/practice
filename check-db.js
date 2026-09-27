import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';

dotenv.config();

async function checkDatabase() {
  if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI is missing from your .env file!');
    process.exit(1);
  }

  try {
    console.log('⏳ Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ Connected successfully!`);
    console.log(`🗄️  Database Name : "${mongoose.connection.name}"`);

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📂 Collections   : [ ${collections.map(c => c.name).join(', ')} ]`);

    const users = await User.find().select('-password');
    console.log(`\n👥 Stored Users (${users.length} found):`);
    console.table(users.map(u => ({
      _id: u._id.toString(),
      username: u.username,
      email: u.email,
      role: u.role,
      organization: u.organization,
      status: u.status,
      clearance: u.clearance
    })));

    await mongoose.disconnect();
    console.log('🔒 Disconnected safely.');
  } catch (err) {
    console.error('❌ Database inspection failed:', err.message);
  }
}

checkDatabase();
