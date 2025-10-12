// routes/contactRoutes.js

const express = require('express');
const { sendContactEmail } = require('../controllers/contactController');

const router = express.Router();

// Define the POST route for contact form submission
router.post('/', sendContactEmail); 

module.exports = router;