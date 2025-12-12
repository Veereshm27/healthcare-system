// config/db.js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!uri) {
      throw new Error(
        "Mongo URI not found in environment (MONGO_URI / MONGODB_URI)"
      );
    }

    // No deprecated options here — mongoose handles defaults internally.
    await mongoose.connect(uri);

    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    // during debugging keep process alive; uncomment to force exit in production
    // process.exit(1);
  }
};

module.exports = connectDB;
