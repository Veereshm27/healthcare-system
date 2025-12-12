require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");
const routes = require("./routes/route");

const app = express();
const PORT = process.env.PORT || 5000;

// VERY IMPORTANT 👇
// handles JSON requests
app.use(express.json());

// handles form-data (without files)
app.use(express.urlencoded({ extended: true }));

// routes
app.use("/api", routes);

// show mongo URI
console.log("Mongo URI:", process.env.MONGO_URI || "undefined");

// connect
connectDB();

// start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
