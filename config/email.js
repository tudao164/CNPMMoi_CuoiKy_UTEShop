const nodemailer = require('nodemailer');
require('dotenv').config();

// Email transporter configuration
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};

// Test email configuration
const testEmailConnection = async () => {
    try {
        const transporter = createTransporter();
        await transporter.verify();
        console.log('✅ Email service connected successfully');
        return true;
    } catch (error) {
        console.error('❌ Email service connection failed:', error.message);
        return false;
    }
};

module.exports = {
    createTransporter,
    testEmailConnection
};
