const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { ResearchPaper } = require("../models");
require("dotenv").config();

// Register User
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const allowedRoles = ["student"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, role });
    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Generate JWT Token
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // Token expires in 1 hour
    );

    // Ensure JWT_SECRET is defined inside .env file
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in the .env file");
    }

    res.status(200).json({ message: "Login successful", token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all Users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'createdAt']
    });
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add User
exports.addUser = async (req, res) => {
  try {
    // Only admin can add users
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Only admin can add users." });
    }
    const { name, email, password, role } = req.body;
    const allowedRoles = ["student", "admin"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid. Only 'student' or 'admin' can be added by admin." });
    }
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, role });
    res.status(201).json({ message: "User added successfully", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update own profile
exports.updateOwnProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    await User.update(
      { name, email },
      { where: { id: req.user.id } }
    );
    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update User
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    await User.update({ name, email, role }, { where: { id: req.params.id } });
    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete User
exports.deleteUser = async (req, res) => {
  try {
    await User.destroy({ where: { id: req.params.id } });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get User Profile from Token (for persistent login)
exports.getUserProfile = async (req, res) => {
  // req.user is populated by authMiddleware if the token is valid
  if (!req.user || !req.user.id) {
    // This case should ideally not be reached if authMiddleware is working
    // but good for robustness
    return res.status(401).json({ message: "Unauthorized: User information not found in token." });
  }

  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'email', 'role', 'name'] // Only fetch necessary user attributes
    });

    if (!user) {
      return res.status(404).json({ message: "User not found in database." });
    }

    res.status(200).json({ user }); // Send back the user object
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getUserResearchPapers = async (req, res) => {
  try {
    console.log("Fetching papers for user:", req.user.id); // Add this line
    const papers = await ResearchPaper.findAll({
      where: { submittedBy: req.user.id },
      order: [["createdAt", "DESC"]],
    });
    console.log("Found papers:", papers); // Add this line
    res.status(200).json({ papers });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
