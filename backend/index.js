require("dotenv").config(); // MUST be first

const express = require("express");
const connectDB = require("./config/db");
const routes = require("./routes/route");
console.log("Routes loaded");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", routes);

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
