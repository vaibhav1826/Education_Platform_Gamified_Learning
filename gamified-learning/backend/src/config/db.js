import mongoose from 'mongoose';

const connectDB = async () => {
  const { MONGO_URI } = process.env;

  if (!MONGO_URI) {
    console.error(
      'Mongo connection error',
      'Missing MONGO_URI env var. Copy backend/env.example into backend/.env and set a Mongo connection string.'
    );
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Mongo connection error', error.message);
    process.exit(1);
  }
};

export default connectDB;