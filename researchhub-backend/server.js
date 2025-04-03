require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { sequelize } = require("./models");
const userRoutes = require("./routes/userRoutes");
const researchRoutes = require("./routes/researchRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/research", researchRoutes);

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected!");
    console.log(`Server running on port ${PORT}`);
    
  } catch (error) {
    console.error("Database connection failed:", error);
  }
});
