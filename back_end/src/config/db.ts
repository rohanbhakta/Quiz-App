import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Environment variables
const MONGODB_URI = process.env.MONGODB_URI;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Validate required environment variables
if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

// Environment-specific configuration
const dbConfig = {
  development: {
    serverSelectionTimeoutMS: 60000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 60000,
    maxPoolSize: 10,
    retryWrites: true
  },
  production: {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 30000,
    maxPoolSize: 50,
    retryWrites: true,
    ssl: true
  }
};

export const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    
    // Log connection attempt
    console.log('MongoDB Connection Attempt:', {
      environment: NODE_ENV,
      uri: MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'), // Hide credentials
      config: dbConfig[NODE_ENV as keyof typeof dbConfig]
    });

    await mongoose.connect(MONGODB_URI, dbConfig[NODE_ENV as keyof typeof dbConfig]);

    console.log('MongoDB Connection Status:', {
      connected: mongoose.connection.readyState === 1,
      database: mongoose.connection.db?.databaseName,
      host: mongoose.connection.host,
      timestamp: new Date().toISOString()
    });

    // Set up connection event handlers
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB Connection Error:', {
        error: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString()
      });
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB Disconnected:', {
        timestamp: new Date().toISOString(),
        environment: NODE_ENV,
        lastConnected: mongoose.connection.host
      });
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB Reconnected:', {
        timestamp: new Date().toISOString(),
        host: mongoose.connection.host
      });
    });

  } catch (error) {
    console.error('MongoDB Connection Error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      environment: NODE_ENV
    });
    process.exit(1);
  }
};

// Handle process termination
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (err) {
    console.error('Error closing MongoDB connection:', err);
    process.exit(1);
  }
});

export default mongoose;
