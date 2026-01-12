const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const { User, Project, Department, Block, Major, Strand } = require("../models");
const { Invitation } = require("../models");
const crypto = require("crypto");
const { Op } = require("sequelize");
require("dotenv").config();
const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

// Register User (public signup: student or guest)
exports.register = async (req, res) => {
  try {
    const {
      full_name, username, email,
      department_id, block_id, major_id, strand_id,
      year_level, grade_level,
      password, confirm_password, role
    } = req.body;

    if (!full_name || !username || !email || !password || !confirm_password) {
      return res.status(400).json({ message: "Missing required fields." });
    }
    if (password !== confirm_password) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    const existing = await User.findOne({ where: { [Op.or]: [{ email }, { username }] } });
    if (existing) {
      return res.status(400).json({ message: "Username or email already in use." });
    }

    // Only allow student and guest for public register
    const allowedRoles = ["student", "guest"];
    const userRole = allowedRoles.includes(role) ? role : "student";

    const hashedPassword = await bcrypt.hash(password, 10);

    const userObj = {
      full_name,
      username,
      email,
      password: hashedPassword,
      role: userRole,
      department_id: department_id || null,
      block_id: block_id || null,
      major_id: major_id || null,
      strand_id: strand_id || null,
      year_level: year_level || null,
      grade_level: grade_level || null,
      force_password_change: false
    };

    const newUser = await User.create(userObj);

    // Optional: Return more details on success (including names via include)
    const createdUser = await User.findByPk(newUser.id, {
      include: [
        { model: Department, attributes: ['name'] },
        { model: Block, attributes: ['name'] },
        { model: Major, attributes: ['name'] },
        { model: Strand, attributes: ['name'] }
      ]
    });

    return res.status(201).json({
      message: "Registration successful",
      user: {
        id: createdUser.id,
        email: createdUser.email,
        username: createdUser.username,
        role: createdUser.role,
        department: createdUser.Department?.name || null,
        block: createdUser.Block?.name || null,
        major: createdUser.Major?.name || null,
        strand: createdUser.Strand?.name || null
      }
    });
  } catch (error) {
    console.error("Register error:", error);
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ message: "Username or Email already in use." });
    }
    res.status(500).json({ error: error.message });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // ← Add this guard
    if (!identifier || !password) {
      return res.status(400).json({ message: "Identifier (email/username) and password are required." });
    }

    const user = await User.findOne({
      where: {
        [Op.or]: [{ email: identifier }, { username: identifier }]
      },
      include: [
        { model: Department, attributes: ['id', 'name'] },
        { model: Block, attributes: ['id', 'name'] },
        { model: Major, attributes: ['id', 'name'] },
        { model: Strand, attributes: ['id', 'name'] }
      ]
    });

    if (!user) return res.status(400).json({ message: "Invalid credentials." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials." });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        username: user.username,
        email: user.email,
        role: user.role,
        department: user.Department?.name || null,
        department_id: user.department_id,
        year_level: user.year_level,
        block: user.Block?.name || null,
        block_id: user.block_id,
        major: user.Major?.name || null,
        major_id: user.major_id,
        strand: user.Strand?.name || null,
        strand_id: user.strand_id,
        grade_level: user.grade_level,
        force_password_change: user.force_password_change,
        profile_pic_url: user.profile_pic_url || '/images/default-pp.png',
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Force change password (protected)
exports.forceChangePassword = async (req, res) => {
  try {
    const { password, confirm_password } = req.body;
    if (!password || !confirm_password) return res.status(400).json({ message: "Password and confirmation required." });
    if (password !== confirm_password) return res.status(400).json({ message: "Passwords do not match." });

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    user.password = await bcrypt.hash(password, 10);
    user.force_password_change = false;
    await user.save();

    return res.json({ message: "Password changed successfully." });
  } catch (error) {
    console.error("Force change password error:", error);
    return res.status(500).json({ message: "Failed to change password." });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required." });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(200).json({ message: "If email exists, reset link sent." });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await resend.emails.send({
      from: process.env.CONTACT_FROM_EMAIL || "ResearchHub <onboarding@resend.dev>",
      to: [email],
      subject: "ResearchHub Password Reset",
      html: `<p>Click <a href="${resetUrl}" target="_blank">here</a> to reset your password. This link expires in 1 hour.</p>`
    });

    res.json({ message: "Please check your email, a reset link has been sent." });
  } catch (error) {
    console.error("❌ RESEND PASSWORD RESET FAILED:", error);
    res.status(500).json({ message: "Failed to send reset email.", error: error.message });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const user = await User.findOne({ where: { resetToken: token, resetTokenExpiry: { [Op.gt]: Date.now() } } });
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

// Get user count
exports.getUserCount = async (req, res) => {
  try {
    const totalUsers = await User.count();
    return res.status(200).json({ totalUsers });
  } catch (error) {
    console.error('Error fetching user count:', error);
    return res.status(500).json({ message: "Failed to fetch user count." });
  }
};

// Get all users (admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'full_name', 'email', 'role', 'created_at', 'force_password_change']
    });
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Invite user (admin)
exports.inviteUser = async (req, res) => {
  try {
    const { email, role, type, department, strand } = req.body;
    const allowedInviteRoles = ["admin", "head_admin", "research_adviser"];
    if (!allowedInviteRoles.includes(role)) return res.status(400).json({ message: "Invalid role for invite." });

    if (role === "research_adviser") {
      if (!type) return res.status(400).json({ message: "Adviser type required." });
      if (type === "college" && !department) return res.status(400).json({ message: "Department required for college adviser." });
      if (type === "senior_high" && !strand) return res.status(400).json({ message: "Strand required for senior high adviser." });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: "Email already registered." });

    const token = crypto.randomBytes(32).toString("hex");
    const invitation = await Invitation.create({
      email,
      username: null,
      token,
      role,
      type: type || null,
      department: department || null,
      strand: strand || null,
    });

    const inviteUrl = `${process.env.FRONTEND_URL}/setup-account?token=${token}`;

    await resend.emails.send({
      from: process.env.CONTACT_FROM_EMAIL || "ResearchHub <onboarding@resend.dev>",
      to: [email],
      subject: `ResearchHub Invitation (${role.replace("_"," ")})`,
      html: `<p>You have been invited as <b>${role.replace("_"," ")}</b>. <p><a href="${inviteUrl}" target="_blank">Click here to set up your account</a></p>`
    });

    res.json({ message: "Invitation sent successfully!" });
  } catch (error) {
    console.error("Invite User Error:", error);
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

// Setup Account (invited users) - created via invite link; should NOT be forced
exports.setupAccount = async (req, res) => {
  try {
    const { token, full_name, username, password, confirm_password } = req.body;
    if (!token || !full_name || !username || !password || !confirm_password) return res.status(400).json({ message: "Missing fields." });
    if (password !== confirm_password) return res.status(400).json({ message: "Passwords do not match." });

    const invitation = await Invitation.findOne({ where: { token, used: false } });
    if (!invitation) return res.status(400).json({ message: "Invalid or expired invitation." });

    const existing = await User.findOne({ where: { [Op.or]: [{ email: invitation.email }, { username }] } });
    if (existing) return res.status(400).json({ message: "Email or username already in use." });

    const userObj = {
      full_name,
      username,
      email: invitation.email,
      password: await bcrypt.hash(password, 10),
      role: invitation.role,
      // invited users setup their own password, do NOT force change
      force_password_change: false
    };

    if (invitation.role === "research_adviser") {
      userObj.type = invitation.type;
      if (invitation.type === "college") {
        // Find department by old name (temporary bridge)
        const dept = await Department.findOne({ where: { name: invitation.department } });
        userObj.department_id = dept ? dept.id : null;
      }
      if (invitation.type === "senior_high") {
        const strand = await Strand.findOne({ where: { name: invitation.strand } });
        userObj.strand_id = strand ? strand.id : null;
      }
    }

    await User.create(userObj);
    invitation.used = true;
    await invitation.save();

    res.json({ message: "Account setup successful. You can now login." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add User (admin manual add) - keep force_password_change true
exports.addUser = async (req, res) => {
  try {
    const { username, full_name, email, password, role, type, department_id, strand_id } = req.body;
    const allowedRoles = ["admin", "head_admin", "research_adviser", "student", "guest"];
    if (!allowedRoles.includes(role)) return res.status(400).json({ message: "Invalid role." });
    if (!username || !full_name || !email || !password) return res.status(400).json({ message: "Missing fields." });

    if (role === "research_adviser") {
      if (!type) return res.status(400).json({ message: "Adviser type required." });
      if (type === "college" && !department_id) return res.status(400).json({ message: "Department required." });
      if (type === "senior_high" && !strand_id) return res.status(400).json({ message: "Strand required." });
    }

    const existing = await User.findOne({ where: { [Op.or]: [{ email }, { username }] } });
    if (existing) return res.status(400).json({ message: "Username or Email already in use." });

    const hashedPassword = await bcrypt.hash(password, 10);

    const userObj = {
      username,
      full_name,
      email,
      password: hashedPassword,
      role,
      // admin-added accounts MUST change password at first login
      force_password_change: true,
    };

    // Assign academic affiliation for research advisers
    if (role === "research_adviser") {
      if (type === "college" && department_id) {
        userObj.department_id = department_id;
      }
      if (type === "senior_high" && strand_id) {
        userObj.strand_id = strand_id;
      }
    }

    const newUser = await User.create(userObj);

    // Better response (use the actual IDs, not old string fields)
    const safeUser = {
      id: newUser.id,
      username: newUser.username,
      full_name: newUser.full_name,
      email: newUser.email,
      role: newUser.role,
      department_id: newUser.department_id,
      strand_id: newUser.strand_id,
      created_at: newUser.created_at
    };

    return res.status(201).json({ message: "User added successfully", user: safeUser });
  } catch (error) {
    console.error("Add user error:", error);
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ message: "Username or Email already in use." });
    }
    return res.status(500).json({ message: "Failed to add user", error: error.message });
  }
};

// Update own profile
exports.updateOwnProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, username, email } = req.body;

    // Basic validation
    if (!full_name || !username || !email) {
      return res.status(400).json({ message: "full_name, username and email are required." });
    }

    // Check for existing username/email used by other users
    const existing = await User.findOne({
      where: {
        [Op.or]: [{ username }, { email }],
        id: { [Op.ne]: userId }
      }
    });
    if (existing) {
      if (existing.username === username) return res.status(409).json({ message: "Username already taken." });
      if (existing.email === email) return res.status(409).json({ message: "Email already in use." });
      return res.status(409).json({ message: "Username or email already in use." });
    }

    // Determine uploaded profile picture url (Cloudinary)
    const profilePicUrl = req.file?.path || req.file?.secure_url || null;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    // Apply changes
    user.full_name = full_name;
    user.username = username;
    user.email = email;
    if (profilePicUrl) user.profile_pic_url = profilePicUrl;
    await user.save();

    // Return updated user (omit sensitive fields)
    const safeUser = {
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
      force_password_change: !!user.force_password_change,
      profile_pic_url: user.profile_pic_url,
      created_at: user.created_at,
      updated_at: user.updated_at
    };

    return res.json({ message: "Profile updated", user: safeUser });
  } catch (error) {
    console.error("updateOwnProfile error:", error);
    // Multer file-too-large
    if (error && (error instanceof multer.MulterError || error.code === "LIMIT_FILE_SIZE")) {
      return res.status(413).json({ message: "Uploaded file is too large. Max size is 5 MB." });
    }
    return res.status(500).json({ message: "Failed to update profile.", error: error.message });
  }
};

// Update user (admin)
exports.updateUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
    const userToUpdate = await User.findByPk(req.params.id);
    if (!userToUpdate) return res.status(404).json({ message: "User not found" });
    if (req.user.id === userToUpdate.id) return res.status(400).json({ message: "Cannot edit own account here." });

    // Accept either 'name' (older API) or 'full_name' (frontend)
    const { name, full_name, email, role, password } = req.body;
    const updatedFullName = full_name || name || userToUpdate.full_name;

    const updatePayload = {
      full_name: updatedFullName,
      email: email || userToUpdate.email,
      role: role || userToUpdate.role
    };

    // If admin provided a new password, hash it and include
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      updatePayload.password = hashed;
      // When admin sets password manually, keep force_password_change = true
      updatePayload.force_password_change = true;
    }

    await userToUpdate.update(updatePayload);
    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ error: error.message, message: "Failed to update user." });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
    const userToDelete = await User.findByPk(req.params.id);
    if (!userToDelete) return res.status(404).json({ message: "User not found" });
    if (req.user.id === userToDelete.id) return res.status(400).json({ message: "Cannot delete own account." });
    await userToDelete.destroy();
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("User deletion error:", error);
    res.status(500).json({ error: error.message, message: "Error deleting user." });
  }
};

// Get user profile
exports.getUserProfile = async (req, res) => {
  if (!req.user || !req.user.id) return res.status(401).json({ message: "Unauthorized" });

  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        { model: Department, attributes: ['id', 'name'] },
        { model: Block, attributes: ['id', 'name'] },
        { model: Major, attributes: ['id', 'name'] },
        { model: Strand, attributes: ['id', 'name'] }
      ]
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    const safeUser = {
      id: user.id,
      full_name: user.full_name,
      username: user.username,
      email: user.email,
      role: user.role,
      department: user.Department?.name || null,
      department_id: user.department_id,
      year_level: user.year_level,
      block: user.Block?.name || null,
      block_id: user.block_id,
      major: user.Major?.name || null,
      major_id: user.major_id,
      strand: user.Strand?.name || null,
      strand_id: user.strand_id,
      grade_level: user.grade_level,
      force_password_change: !!user.force_password_change,
      profile_pic_url: user.profile_pic_url || null,
      created_at: user.created_at,
      updated_at: user.updated_at
    };

    return res.json({ user: safeUser });
  } catch (error) {
    console.error("getUserProfile error:", error);
    return res.status(500).json({ message: "Failed to fetch profile.", error: error.message });
  }
};

// getUserProjects
exports.getUserProjects = async (req, res) => {
  try {
    if (!req.user || !req.user.id) return res.status(401).json({ message: "Unauthorized" });

    console.log(`getUserProjects called for user id=${req.user.id}`);

    const projects = await Project.findAll({
      where: { submitted_by: req.user.id },
      order: [["created_at", "DESC"]],
      include: [
        { model: User, as: "submitter", attributes: ["id", "full_name", "email", "department", "year_level", "grade_level"] }
      ]
    });

    console.log(`getUserProjects: found ${projects.length} projects for user ${req.user.id}`);

    return res.json({ projects });
  } catch (error) {
    console.error("getUserProjects error:", error);
    return res.status(500).json({ message: "Failed to fetch projects", error: error.message });
  }
};