require('dotenv').config();
const nodemailer = require('nodemailer');

// Create transporter directly in test
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Test email connection
async function testEmailConnection() {
  try {
    console.log('Testing email connection...');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 'NOT SET');
    
    // Verify connection
    await transporter.verify();
    console.log('✅ Email connection successful!');
    
    // Send test email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to yourself
      subject: 'CRM Email Test',
      html: '<h1>Email configuration is working!</h1><p>Your forgot password feature is ready to use.</p>'
    });
    
    console.log('✅ Test email sent:', info.messageId);
    console.log('🎉 Email setup is complete!');
    
  } catch (error) {
    console.error('❌ Email connection failed:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n🔧 SOLUTION:');
      console.log('1. Go to https://myaccount.google.com/security');
      console.log('2. Enable 2-Step Verification');
      console.log('3. Generate App Password for "Mail"');
      console.log('4. Update EMAIL_PASS in .env file');
    }
  }
  
  process.exit();
}

testEmailConnection();
