const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = 'mongodb+srv://User:User123@cluster0.mvjgp8s.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
    
    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
