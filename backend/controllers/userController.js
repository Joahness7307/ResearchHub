const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { Project } = require("../models");
const { Invitation } = require("../models");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { Op } = require("sequelize");
require("dotenv").config();

// Register User

exports.register = async (req, res) => {

  try {

    const {

      full_name, username, email, department, year_level, block,

      password, confirm_password, role, strand, grade_level, major

    } = req.body;

    // --- Universal Validation ---

    if (!full_name || !username || !email || !password || !confirm_password) {

      console.error("Register validation error: Missing universal required fields.");

      return res.status(400).json({ message: "Full name, username, email, password, and confirmation are required." });

    }

    if (password !== confirm_password) {

      console.error("Register validation error: Passwords do not match.");

      return res.status(400).json({ message: "Passwords do not match." });

    }

    const existing = await User.findOne({ where: { [Op.or]: [{ email }, { username }] } });

    if (existing) {

      return res.status(400).json({ message: "Username or Email already registered." });

    }

    // ----------------------------

    // Only allow student and guest role for public registration

    const allowedRoles = ["student", "guest"];

    // If role is missing or invalid, default to 'student' to enforce student validation

    const userRole = allowedRoles.includes(role) ? role : "student"; 

    const hashedPassword = await bcrypt.hash(password, 10);

    let newUser;

    // 1. Guest registration

    if (userRole === "guest") {

      // All required fields were checked in the universal validation

      newUser = await User.create({

        full_name,

        username,

        email,

        password: hashedPassword,

        role: "guest"

      });

      return res.status(201).json({ message: "Guest registered successfully", newUser });

    }

    // 2. Student registration (College OR Senior High)

    if (userRole === "student") {

      

      // Senior High (Check for strand/grade_level)

      if (strand && grade_level) {

        const validStrands = ["ABM", "STEM", "TVL", "HUMSS"];

        const validGradeLevels = ["11", "12"];

        if (!validStrands.includes(strand) || !validGradeLevels.includes(grade_level)) {

          return res.status(400).json({ message: "Invalid strand or grade level." });

        }

        newUser = await User.create({

          full_name, username, email,

          strand, grade_level,

          password: hashedPassword,

          role: "student",

          type: "senior_high"

        });

        return res.status(201).json({ message: "Senior high student registered successfully", newUser });

      }

      // College (Check for department/year_level)

      if (department && year_level) {

        

        // Conditional validation

        if ((department === "BSED") && !major) {

          console.error("Register validation error: Major is required for BSED department.");

          return res.status(400).json({ message: "Major is required for BSED department." });

        }

        if ((department === "BSIT" || department === "BSHM") && !block) {

          console.error("Register validation error: Block is required for BSIT/BSHM department.");

          return res.status(400).json({ message: "Block is required for BSIT/BSHM department." });

        }

        

        newUser = await User.create({

          full_name, username, email, department, year_level,

          block: (department === "BSIT" || department === "BSHM") ? block : null,

          major: (department === "BSED") ? major : null,

          password: hashedPassword,

          role: "student",

          type: "college"

        });

        return res.status(201).json({ message: "College student registered successfully", newUser });

      }

      

      // If student role is specified but essential fields are missing

      return res.status(400).json({ message: "Student registration requires either Department/Year Level (College) or Strand/Grade Level (SHS)." });

    }

    // Fallback if the logic flow is bypassed

    console.error("Register validation error: Invalid registration attempt.");

    return res.status(400).json({ message: "Invalid registration data or role." });

  } catch (error) {

    console.error("Register error:", error);

    // Check for unique constraint error

    if (error.name === 'SequelizeUniqueConstraintError') {

      return res.status(400).json({ message: "Username or Email already in use." });

    }

    res.status(500).json({ error: error.message });

  }

};

// Login User
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    const { Op } = require("sequelize");
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { email: identifier },
          { username: identifier }
        ]
      }
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Generate JWT Token
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" } // Token expires in 7 days
    );

    // Ensure JWT_SECRET is defined inside .env file
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in the .env file");
    }

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        username: user.username,
        email: user.email,
        role: user.role,
        department: user.department,
        year_level: user.year_level,
        block: user.block,
        major: user.major,
        strand: user.strand,
        grade_level: user.grade_level,
        type: user.type,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    // if (!user) return res.status(200).json({ message: "If your email exists, a reset link has been sent." });

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 1000 * 60 * 60; // 1 hour
    await user.save();

    // Send email
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: "ResearchHub Password Reset",
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 1 hour.</p>`
    });

    res.json({ message: "Please check your email, a reset link has been sent." });
  } catch (error) {
    res.status(500).json({ message: "Failed to send reset email.", error: error.message });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const user = await User.findOne({
      where: {
        resetToken: token,
        resetTokenExpiry: { [Op.gt]: Date.now() }
      }
    });
    if (!user) return res.status(400).json({ message: "Invalid or expired token." });

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    res.json({ message: "Password reset successful. You can now login." });
  } catch (error) {
    res.status(500).json({ message: "Failed to reset password.", error: error.message });
  }
};

// NEW: Get total count of all users (for Admin Dashboard)
exports.getUserCount = async (req, res) => {
    try {
        // Option A: Count ALL users (Simplest fix, matches your goal of 'Total Users')
        const totalUsers = await User.count(); 

        /* // Option B: Count all users excluding "guest" if you have temporary guest accounts
        const totalUsers = await User.count({
            where: {
                role: { [Op.ne]: 'guest' } // Requires 'Op' from Sequelize
            }
        });
        */

        return res.status(200).json({ totalUsers }); 
    } catch (error) {
        console.error('Error fetching user count:', error);
        return res.status(500).json({ message: "Failed to fetch user count." });
    }
};

// Get all Users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'full_name', 'email', 'role', 'created_at']
    });
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Invite user
exports.inviteUser = async (req, res) => {
  try {
    const { email, role, type, department, strand, username } = req.body;
    if (!["admin", "head_admin", "research_adviser"].includes(role)) {
      return res.status(400).json({ message: "Invalid role." });
    }
    if (role === "research_adviser" && !type) {
      return res.status(400).json({ message: "Type is required for research adviser." });
    }
    if (role === "research_adviser" && type === "college" && !department) {
      return res.status(400).json({ message: "Department is required for college adviser." });
    }
    if (role === "research_adviser" && type === "senior_high" && !strand) {
      return res.status(400).json({ message: "Strand is required for senior high adviser." });
    }
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: "User already exists." });

    const token = crypto.randomBytes(32).toString("hex");
    await Invitation.create({
      email,
      username: username || null,
      token,
      role,
      type: type || null,
      department: department || null,
      strand: strand || null,
    });

    // Send email
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
    const inviteUrl = `${process.env.FRONTEND_URL}/setup-account?token=${token}`;
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: `ResearchHub Invitation (${role})`,
      html: `<p>You have been invited as <b>${role.replace("_", " ")}</b>.<br><a href="${inviteUrl}">Click here to setup your account</a></p>`
    });

    res.json({ message: "Invitation sent!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getInvitationInfo = async (req, res) => {
  try {
    const { token } = req.query;
    const invitation = await Invitation.findOne({ where: { token, used: false } });
    if (!invitation) return res.status(404).json({ message: "Invalid or expired invitation." });
    res.json({ invitation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Setup Account
exports.setupAccount = async (req, res) => {
  try {
    const { token, full_name, username, password, confirm_password } = req.body;
    if (!token || !full_name || !username || !password || !confirm_password) {
      return res.status(400).json({ message: "Missing required fields." });
    }
    if (password !== confirm_password) {
      return res.status(400).json({ message: "Passwords do not match." });
    }
    const invitation = await Invitation.findOne({ where: { token, used: false } });
    if (!invitation) return res.status(400).json({ message: "Invalid or expired invitation." });

    const userObj = {
      full_name,
      username,
      email: invitation.email,
      password: await bcrypt.hash(password, 10),
      role: invitation.role
    };
    if (invitation.role === "research_adviser") {
      if (invitation.type === "college") userObj.department = invitation.department;
      if (invitation.type === "senior_high") userObj.strand = invitation.strand;
    }
    await User.create(userObj);
    invitation.used = true;
    await invitation.save();

    res.json({ message: "Account setup successful. You can now login." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add User
exports.addUser = async (req, res) => {
  try {
    // Only admin can add users
    if (!req.user || !["admin", "head_admin", "research_adviser", "admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied: Only admin can add users." });
    }
    const { name, email, department, yearLevel, block, password, role } = req.body;
    const allowedRoles = ["admin", "research_adviser", "teacher", "student"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role." });
    }
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, department, yearLevel, block, password: hashedPassword, role });
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
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: [
        "id", "full_name", "username", "email", "role", "department", "year_level",
        "block", "major", "strand", "grade_level", "created_at", "updated_at"
      ]
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user }); // <-- Must be { user: ... }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserProjects = async (req, res) => {
  try {
    console.log("Fetching projects for user:", req.user.id); // Add this line
    const projects = await Project.findAll({
      where: { submitted_by: req.user.id },
      order: [["created_at", "DESC"]],
    });   
    console.log("Found projects:", projects); // Add this line
    res.status(200).json({ projects });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
