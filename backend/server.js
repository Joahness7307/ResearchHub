require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { sequelize } = require("./models");
const http = require("http");
const { Server } = require("socket.io");

// routes …
const userRoutes = require("./routes/userRoutes");
const projectRoutes = require("./routes/projectRoutes");
const commentRoutes = require("./routes/commentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const contactRoutes = require('./routes/contactRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL || "*" },
});
app.set("io", io);

/* ---------- CORS ---------- */
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
];

const corsOptions = {
  origin: (origin, cb) => (!origin || allowedOrigins.includes(origin)) ? cb(null, true) : cb(new Error("CORS")),
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

/* ---------- Middleware ---------- */
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads"));

/* ---------- Routes ---------- */
app.get("/health", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL || "*");
  res.json({ status: "ok" });
});

app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use('/api/contact', contactRoutes);

/* ---------- Error handler ---------- */
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

/* ---------- Start ---------- */
const PORT = process.env.PORT || 4000;
server.listen(PORT, async () => {
  try {
    await sequelize.authenticate();
    console.log("DB connected");
    console.log(`Server listening on ${PORT}`);
  } catch (e) {
    console.error("DB error:", e);
  }
});