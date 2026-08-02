import mongoose from 'mongoose';

let cached: typeof mongoose | null = null;

export const connectDB = async () => {
  if (cached) {
    return cached;
  }

  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    
    // Serverless caching check: reuse existing connection if already established
    if (mongoose.connection.readyState >= 1) {
      return mongoose;
    }

    cached = await mongoose.connect(uri);
    console.log('MongoDB Connected');
    return cached;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error; // Don't process.exit in serverless, let the function fail cleanly
  }
};
