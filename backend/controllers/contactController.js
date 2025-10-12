// controllers/contactController.js

const nodemailer = require('nodemailer');

// 1. Configure the Transporter using environment variables
const transporter = nodemailer.createTransport({
    service: 'gmail', // Use 'gmail' for simplicity, or 'smtp' if needed
    auth: {
        user: process.env.SMTP_USER, // joahnesscaparas358@gmail.com
        pass: process.env.SMTP_PASS  // fkuv fzpf nkoo mohc
    }
});

/**
 * @desc    Send a contact message to the developer
 * @route   POST /api/contact
 * @access  Public
 */
const sendContactEmail = async (req, res) => {
    const { email, message } = req.body;

    if (!email || !message) {
        return res.status(400).json({ message: 'Please provide both email and message.' });
    }

    try {
        // 2. Define the email content
        const mailOptions = {
            from: process.env.SMTP_USER, // The sending account
            to: process.env.SMTP_USER,   // The recipient (the developer)
            subject: `New Contact Form Submission from ${email}`,
            text: `
                A new message has been submitted via the contact form:
                
                Sender Email: ${email}
                
                Message:
                ---
                ${message}
                ---
            `,
            html: `
                <p>A new message has been submitted via the contact form:</p>
                <p><b>Sender Email:</b> ${email}</p>
                <p><b>Message:</b></p>
                <p style="white-space: pre-wrap; padding: 10px; border: 1px solid #ccc;">${message}</p>
            `
        };

        // 3. Send the email
        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Message sent successfully!' });

    } catch (error) {
        console.error('Error sending contact email:', error);
        res.status(500).json({ message: 'Failed to send message.', error: error.message });
    }
};

module.exports = {
    sendContactEmail
};