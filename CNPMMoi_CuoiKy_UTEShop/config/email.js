const nodemailer = require('nodemailer');
require('dotenv').config();

// Email transporter configuration
const createTransporter = () => {
    // Gmail SMTP configuration with better error handling
    const config = {
        service: 'gmail', // Use service instead of host for Gmail
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        },
        debug: true, // Enable debug logging
        logger: true // Enable logging
    };

    console.log('📧 Email config:', {
        service: config.service,
        user: config.auth.user,
        passLength: config.auth.pass ? config.auth.pass.length : 0
    });

    return nodemailer.createTransport(config);
};

// Test email configuration
const testEmailConnection = async () => {
    try {
        console.log('📧 Testing email connection...');
        const transporter = createTransporter();
        
        // Verify connection
        const verified = await transporter.verify();
        console.log('✅ Email service connected successfully:', verified);
        return true;
    } catch (error) {
        console.error('❌ Email service connection failed:');
        console.error('Error details:', error);
        console.error('Error code:', error.code);
        console.error('Error command:', error.command);
        
        // Provide specific error guidance
        if (error.code === 'EAUTH') {
            console.error('🔑 Authentication failed. Please check:');
            console.error('   1. Email address is correct');
            console.error('   2. App Password is correct (not regular password)');
            console.error('   3. 2-Step Verification is enabled on Gmail');
            console.error('   4. App Password was generated correctly');
        }
        
        return false;
    }
};

module.exports = {
    createTransporter,
    testEmailConnection
};
