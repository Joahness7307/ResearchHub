const bcrypt = require("bcryptjs");
const supabase = require("../config/supabaseClient");
const jwt = require("jsonwebtoken");
const { UserProfile } = require("../models"); 
const { ResearchPaper } = require("../models");
require("dotenv").config();

// Register User
exports.register = async (req, res) => {
  try {
    const {
      full_name,
      email,
      department,
      year_level,
      block,
      gender,
      password,
      confirmPassword
    } = req.body;

    // Allowed values
    const allowedDepartments = ["BSIT", "BSHM", "BSED", "BPED", "BSENTREP"];
    const allowedYearLevels = ["1", "2", "3", "4"];
    const allowedBlocks = ["A", "B", "C", "D", "E"];
    const allowedGenders = ["Male", "Female"];

    // Validate required fields
    if (
      !full_name ||
      !email ||
      !department ||
      !year_level ||
      !block ||
      !gender ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    if (!allowedDepartments.includes(department)) {
      return res.status(400).json({ message: "Invalid department" });
    }
    if (!allowedYearLevels.includes(year_level)) {
      return res.status(400).json({ message: "Invalid year level" });
    }
    if (!allowedBlocks.includes(block)) {
      return res.status(400).json({ message: "Invalid block" });
    }
    if (!allowedGenders.includes(gender)) {
      return res.status(400).json({ message: "Invalid gender" });
    }

    // Check if email already exists in user_profiles
    const existingUser = await UserProfile.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // 1. Create user in Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (error) {
      return res.status(400).json({ message: "Supabase Auth error: " + error.message });
    }

    const supabaseUserId = data.user.id;

    // Check if a profile with this user_id already exists
    const existingProfile = await UserProfile.findOne({ where: { user_id: supabaseUserId } });
    if (existingProfile) {
      // Instead of blocking, update the profile
      await existingProfile.update({
        full_name,
        email,
        department,
        year_level,
        block,
        gender,
        role: "student",
        updated_at: new Date()
      });
      return res.status(200).json({ message: "User profile updated successfully.", user: existingProfile });
    }

    // 2. Create user profile in your table
    const user = await UserProfile.create({
      user_id: supabaseUserId,
      full_name,
      email,
      department,
      year_level,
      block,
      gender,
      role: "student",
      created_at: new Date(),
      updated_at: new Date()
    });

    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    console.error("Sequelize error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Login User
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Use Supabase for all authentication
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) {
            return res.status(400).json({ message: "Invalid credentials." });
        }

        const user = await UserProfile.findOne({ where: { user_id: data.user.id } });
        if (!user) {
            return res.status(404).json({ message: "User profile not found. Please contact support." });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, user_id: user.user_id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all Users
exports.getAllUsers = async (req, res) => {
 try {
    const users = await UserProfile.findAll({
      attributes: ['id', 'full_name', 'email', 'role', 'created_at']
    });
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add User (Admin only)
exports.addUser = async (req, res) => {
  try {
    // Authorization check
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Only admin can add users." });
    }

    // Destructure all required fields
    const { full_name, email, password, role, department, year_level, block, gender } = req.body;

    // Validate required fields
    if (!full_name || !email || !password || !role || department === undefined || year_level === undefined || block === undefined || gender === undefined) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Role validation
    const allowedRoles = ["student", "admin"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role. Only 'student' or 'admin' can be added by admin." });
    }

  // 1. Check if user already exists in your local database by email or user_id
const existingUserByEmail = await UserProfile.findOne({ where: { email } });
if (existingUserByEmail) {
  return res.status(409).json({ message: "User with this email already has a profile in the local database." });
}

// Try to create user in Supabase Auth
const { data: authData, error: authError } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true
});

let supabaseUserId;

if (authError) {
  if (authError.message.includes("already registered")) {
    const { data: existingSupabaseUser, error: getUserError } = await supabase.auth.admin.getUserByEmail(email);
    if (getUserError) {
      return res.status(500).json({ message: "Failed to get existing user from Supabase Auth: " + getUserError.message });
    }
    supabaseUserId = existingSupabaseUser.user.id;

    // Check if a profile with this Supabase user_id already exists locally
    const existingProfileByUserId = await UserProfile.findOne({ where: { user_id: supabaseUserId } });
    if (existingProfileByUserId) {
      return res.status(409).json({ message: "User profile already exists in local database." });
    }
    // If no profile, allow creation below
  } else {
    return res.status(500).json({ message: "Supabase Auth error: " + authError.message });
  }
} else {
  supabaseUserId = authData.user.id;
}

// Final check before creation
const existingProfileByUserId = await UserProfile.findOne({ where: { user_id: supabaseUserId } });
if (existingProfileByUserId) {
  return res.status(409).json({ message: "User profile already exists in local database." });
}

// Create the user profile in your local table
const user = await UserProfile.create({ 
  user_id: supabaseUserId,
  full_name, 
  email, 
  department,
  year_level,
  block,
  gender,
  role,
  created_at: new Date(),
  updated_at: new Date()
});

res.status(201).json({ message: "User added successfully", user });
  } catch (error) {
  console.error("Error in addUser:", error);
  res.status(500).json({ error: "Internal Server Error" });
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
    const { full_name, email, role, department, year_level, block, gender, bio, profile_picture_url } = req.body;
    const updateFields = { full_name, email, role, department, year_level, block, gender, bio, profile_picture_url, updated_at: new Date() };
    await UserProfile.update(updateFields, { where: { id: req.params.id } });
    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete User
exports.deleteUser = async (req, res) => {
  try {
    // Find the user profile first
    const user = await UserProfile.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // If user has a Supabase Auth account, delete from Supabase Auth
    if (user.user_id) {
      const { error } = await supabase.auth.admin.deleteUser(user.user_id);
      if (error) return res.status(500).json({ error: "Failed to delete from Supabase Auth: " + error.message });
    }

    // Delete from your profile table
    await UserProfile.destroy({ where: { id: req.params.id } });

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
