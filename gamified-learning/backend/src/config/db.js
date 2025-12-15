import mongoose from "mongoose";

const connectDB = async () => {
  const { MONGO_URI } = process.env;

  // Safety Check: Did we forget the connection string?
  if (!MONGO_URI) {
    console.error(
      "\x1b[31m%s\x1b[0m",
      "Mongo connection error: Missing MONGO_URI environment variable."
    );
    process.exit(1); // Kill the app because we can't do anything without a DB!
  }

  try {
    // This setting prepares us for future Mongoose versions, just good housekeeping.
    mongoose.set("strictQuery", false);

    // Attempt the connection...
    const conn = await mongoose.connect(MONGO_URI);

    // Success! Let the developer know where we're connected.
    console.log(
      "\x1b[32m%s\x1b[0m",
      `MongoDB connected: ${conn.connection.host}`
    );
  } catch (error) {
    // If we can't connect, there's no point in running the server.
    // Log the error in red so it's impossible to miss.
    console.error(
      "\x1b[31m%s\x1b[0m",
      "Mongo connection error:",
      error.message
    );
    process.exit(1);
  }
};

export default connectDB;
