import mongoose from "mongoose";

const connectDB = async () => {
  const { MONGO_URI } = process.env;

  if (!MONGO_URI) {
    console.error(
      "\x1b[31m%s\x1b[0m",
      "Mongo connection error: Missing MONGO_URI environment variable."
    );
    process.exit(1);
  }

  try {
    mongoose.set("strictQuery", false); // avoid deprecation warnings
    const conn = await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(
      "\x1b[32m%s\x1b[0m",
      `MongoDB connected: ${conn.connection.host}`
    );
  } catch (error) {
    console.error(
      "\x1b[31m%s\x1b[0m",
      "Mongo connection error:",
      error.message
    );
    process.exit(1);
  }
};

export default connectDB;
