// index.js
require("dotenv").config(); // <-- load env first, always

const express = require("express");
const connectDB = require("./config/db");
const routes = require("./routes/route");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use("/api", routes);

// debug: show what env var Node sees (first 60 chars)
console.log(
  "MONGO env var (preview):",
  (process.env.MONGO_URI || process.env.MONGODB_URI || "undefined").slice(0, 60)
);

connectDB(); // connect after dotenv is loaded

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
