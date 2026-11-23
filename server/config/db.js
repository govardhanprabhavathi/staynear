const mongoose = require('mongoose');

let mongodInstance = null;

const connectDB = async () => {
  try {
    let mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      console.log('⚡ No MONGODB_URI provided. Initializing in-memory MongoDB server for zero-config local development...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create();
      mongoURI = mongodInstance.getUri();
      console.log('✅ In-memory MongoDB server started at:', mongoURI);
    }

    const conn = await mongoose.connect(mongoURI, {
      autoIndex: true,
    });

    console.log(`🌿 MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongodInstance) {
      await mongodInstance.stop();
    }
  } catch (error) {
    console.error('Error disconnecting MongoDB:', error);
  }
};

module.exports = { connectDB, disconnectDB };
