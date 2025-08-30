// userRoutes.js
const express = require("express");
const { UserProfile } = require("../models");
const { register, login, getAllUsers, addUser, updateOwnProfile, updateUser, deleteUser, getUserProfile, getUserResearchPapers } = require("../controllers/userController"); // Import getUserProfile
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Public routes - no role protection needed
router.post("/register", register);
router.post("/login", login);

// Test route to check database connection
// router.get("/test-connection", async (req, res) => {
//   try {
//     const users = await UserProfile.findAll({ limit: 5 });
//     res.json(users);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Database test failed" });
//   }
// });

// TEMPORARY: Create first admin (remove after use)
// router.post("/create-admin", async (req, res) => {
//     const { full_name, email, password } = req.body;
//     if (!full_name || !email || !password) {
//         return res.status(400).json({ message: "All fields are required" });
//     }
//     try {
//         const { UserProfile } = require("../models");
//         const supabase = require("../config/supabaseClient");

//         let supabaseUserId;

//         // Try to create the user in Supabase Auth
//         const { data: authData, error: authError } = await supabase.auth.admin.createUser({
//             email,
//             password,
//             email_confirm: true
//         });

//         // If user already exists in Supabase Auth, get their user ID
//         if (authError && authError.message.includes("already registered")) {
//             const { data: existingUser, error: existingUserError } = await supabase.auth.admin.getUserByEmail(email);
//             if (existingUserError) {
//                 return res.status(500).json({ message: "Failed to retrieve existing user from Supabase Auth." });
//             }
//             supabaseUserId = existingUser.user.id;
//         } else if (authError) {
//             return res.status(400).json({ message: "Supabase Auth error: " + authError.message });
//         } else {
//             supabaseUserId = authData.user.id;
//         }
        
//         // Now, check for the user's profile in your local table using the retrieved user ID.
//         const existingProfile = await UserProfile.findOne({ where: { user_id: supabaseUserId } });
//         if (existingProfile) {
//             // A profile already exists for this user ID, update the existing profile
//             const updatedProfile = await existingProfile.update({
//                 full_name,
//                 email,
//                 role: "admin"
//             });
//             return res.status(200).json({ message: "Admin profile updated successfully.", admin: updatedProfile });
//         }

//         // Create the new admin profile in your table
//         const admin = await UserProfile.create({
//             full_name,
//             email,
//             role: "admin",
//             department: null,
//             year_level: "Not specified",
//             block: "Not specified",
//             gender: "Not specified",
//             bio: null,
//             profile_picture_url: null,
//             created_at: new Date(),
//             updated_at: new Date(),
//             user_id: supabaseUserId
//         });

//         res.status(201).json({ message: "Admin created successfully.", admin });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// });

// Admin-only routes for adding, updating, and deleting users
router.get("/all", authMiddleware(["admin"]), getAllUsers);
router.post("/add", authMiddleware(["admin"]), addUser);           // Only Admin can add user
router.put("/update/:id", authMiddleware(["admin"]), updateUser); // Only Admin can update user
router.delete("/delete/:id", authMiddleware(["admin"]), deleteUser); // Only Admin can delete user

// Protected route to get user profile
router.get("/profile", authMiddleware(["student", "admin"]), getUserProfile); // Uses authMiddleware to verify token and populate req.user
router.put("/profile/update", authMiddleware(["student", "admin"]), updateOwnProfile);
// Get all research papers submitted by the logged-in user
router.get("/my-papers", authMiddleware(["student", "admin"]), getUserResearchPapers);

module.exports = router;