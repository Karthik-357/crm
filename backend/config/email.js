const nodemailer = require('nodemailer');

// Create reusable transporter object using environment variables
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can change this to other email services
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Use app-specific password for Gmail
  },
});

// Test the connection (optional)
const testConnection = async () => {
  try {
    await transporter.verify();
    console.log('Email service is ready to send messages');
  } catch (error) {
    console.error('Email service error:', error);
  }
};

// Email templates
const emailTemplates = {
  passwordReset: (resetLink, userName) => ({
    subject: 'Password Reset Request - CRM System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #6366f1; margin-bottom: 20px;">Password Reset Request</h2>
          <p style="color: #333; font-size: 16px;">Hi ${userName},</p>
          <p style="color: #333; font-size: 16px;">You have requested to reset your password. Click the link below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
          </div>
          <p style="color: #666; font-size: 14px;">This link will expire in 24 hours.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request this password reset, please ignore this email.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">This is an automated message from CRM System.</p>
        </div>
      </div>
    `
  }),
  
  otpEmail: (otp, userName) => ({
    subject: 'Password Reset OTP - CRM System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #6366f1; margin-bottom: 20px;">Password Reset OTP</h2>
          <p style="color: #333; font-size: 16px;">Hi ${userName},</p>
          <p style="color: #333; font-size: 16px;">You have requested to reset your password. Please use the following OTP to verify your identity:</p>
          <div style="background-color: #f0f0f0; padding: 20px; margin: 20px 0; text-align: center; border-radius: 5px;">
            <h1 style="color: #6366f1; font-size: 36px; margin: 0; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p style="color: #666; font-size: 14px;"><strong>This OTP is valid for 10 minutes only.</strong></p>
          <p style="color: #666; font-size: 14px;">If you didn't request this password reset, please ignore this email.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">This is an automated message from CRM System.</p>
        </div>
      </div>
    `
  })
};

// Initialize connection test when module is loaded
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  testConnection();
}

module.exports = {
  transporter,
  emailTemplates
};