// controllers/contactController.js
const { Resend } = require("resend");
require("dotenv").config();

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * @desc    Send a contact message to the developer
 * @route   POST /api/contact
 * @access  Public
 */
const sendContactEmail = async (req, res) => {
  const { email, message } = req.body;

  if (!email || !message) {
    return res.status(400).json({ message: "Please provide both email and message." });
  }

  try {
    const response = await resend.emails.send({
      from: process.env.CONTACT_FROM_EMAIL, // e.g., "ResearchHub <onboarding@resend.dev>"
      to: [process.env.CONTACT_TO_EMAIL],   // your email to receive messages
      subject: `New Contact Form Submission from ${email}`,
      html: `
        <p>A new message has been submitted via the contact form:</p>
        <p><b>Sender Email:</b> ${email}</p>
        <p><b>Message:</b></p>
        <p style="white-space: pre-wrap; padding: 10px; border: 1px solid #ccc;">${message}</p>
      `,
    });

    console.log("Contact email sent:", response);

    res.status(200).json({ message: "Message sent successfully!" });
  } catch (error) {
    console.error("Error sending contact email:", error);
    res.status(500).json({ message: "Failed to send message.", error: error.message });
  }
};

module.exports = { sendContactEmail };
