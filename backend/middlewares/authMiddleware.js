const jwt = require("jsonwebtoken");
const { User } = require("../models");

const authMiddleware = (roles = []) => {
  return async (req, res, next) => {
    try {
      const token = req.header("Authorization")?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ message: "Unauthorized access" });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id);

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Only check roles if roles array is not empty
      if (roles.length > 0 && !roles.includes(user.role)) {
        return res.status(403).json({ message: "Forbidden: You do not have the required role" });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };
};

module.exports = authMiddleware;