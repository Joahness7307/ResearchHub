// filepath: backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { sequelize } = require("./models");
const http = require("http");
const { Server } = require("socket.io");

// Import routes
const userRoutes = require("./routes/userRoutes");
const projectRoutes = require("./routes/projectRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const commentRoutes = require("./routes/commentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const contactRoutes = require('./routes/contactRoutes');

const app = express();

// Server + Socket.io setup
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL || "*" },
});
app.set("io", io);

// Middleware
app.use(cors({
  origin: [process.env.FRONTEND_URL],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(bodyParser.json());
app.use("/uploads", express.static("uploads"));

// Health check route (important for Render)
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server running fine" });
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use('/api/contact', contactRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  try {
    // await sequelize.sync({ alter: true });
    // 1. New: Test the database connection without modifying the schema
    await sequelize.authenticate(); 
    console.log("✅ Database connected successfully!");
    console.log(`🚀 Server running on port ${PORT}`);
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }
});
