// authMiddleware.js
const jwt = require("jsonwebtoken");

module.exports = (requiredRole) => (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({ message: "Access denied" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // Check if the user's role matches the required role
    if (requiredRole && req.user.role !== requiredRole) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};
