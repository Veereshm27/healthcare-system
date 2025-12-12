const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("MONGO_URI missing");

    await mongoose.connect(uri);

    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB Connection Error:", err);
  }
};

module.exports = connectDB;
