// filepath: researchhub-backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser"); // Keep for JSON requests
const { sequelize } = require("./models");
const userRoutes = require("./routes/userRoutes");
const researchRoutes = require("./routes/researchRoutes");
const reviewRoutes = require("./routes/reviewRoutes"); // Assuming you have this route
const commentRoutes = require("./routes/commentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: { origin: "*" }
});

app.set("io", io);

// Middleware
app.use(cors());
// IMPORTANT: bodyParser.json() handles JSON payloads, but NOT multipart/form-data for file uploads.
// Multer handles the multipart/form-data parsing.
app.use(bodyParser.json());

// Serve static uploaded files (e.g., research documents)
// When a document is uploaded, its path might be something like 'src\uploads\research_documents\document-167888888.pdf'
// You want to make these accessible via a URL like http://localhost:5000/uploads/research_documents/document-167888888.pdf
app.use('/uploads', express.static('uploads'));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/research", researchRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notificationRoutes);

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected!");
    console.log(`Server running on port ${PORT}`);
  } catch (error) {
    console.error("Database connection failed:", error);
  }
});