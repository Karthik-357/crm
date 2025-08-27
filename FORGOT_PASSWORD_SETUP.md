# Forgot Password Setup Instructions

## Overview
The forgot password feature has been implemented with a 3-step OTP-based verification system:

1. **Step 1**: User enters email address
2. **Step 2**: User receives and enters 6-digit OTP
3. **Step 3**: User sets new password with confirmation

## Backend Setup

### 1. Email Configuration
Update your `backend/.env` file with your email credentials:

```env
# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password
FRONTEND_URL=http://localhost:3000
```

#### For Gmail:
1. Enable 2-Factor Authentication
2. Generate an App-Specific Password:
   - Go to Google Account settings
   - Security > App Passwords
   - Generate a new app password for "Mail"
   - Use this password in `EMAIL_PASS`

### 2. Required Dependencies
The following packages are now installed:
- `nodemailer` - For sending emails
- `socket.io` - For real-time features

### 3. New API Endpoints
- `POST /api/auth/send-otp` - Send OTP to user's email
- `POST /api/auth/verify-otp` - Verify the OTP
- `POST /api/auth/reset-password` - Reset password with OTP

## Frontend Setup

### 1. Dependencies Installed
- `@emailjs/browser` - EmailJS integration (backup option)

### 2. New Components
- `ForgotPasswordFlow.jsx` - Complete 3-step password reset flow

### 3. Updated Components
- `Login.jsx` - Now includes "Forgot Password?" link

## Features Implemented

### 1. Secure OTP System
- 6-digit numeric OTP
- 10-minute expiration
- Stored securely in database with expiry

### 2. Multi-Step UI
- Progress indicator showing current step
- Navigation between steps (Back/Forward)
- Form validation at each step

### 3. Email Templates
- Professional HTML email templates
- Clear OTP presentation
- Security information included

### 4. Error Handling
- Network error handling
- Invalid OTP handling
- Expired OTP handling
- User-friendly error messages

### 5. Security Features
- OTP stored with expiration
- Password strength validation
- Secure password hashing
- Token-based verification

## Database Schema Updates

The User model now includes:
```javascript
// OTP fields for forgot password
otp: {
  type: String
},
otpExpiry: {
  type: Date
}
```

## Usage

1. **User clicks "Forgot Password?" on login page**
2. **Enters email address** - System sends OTP to email
3. **Enters 6-digit OTP** - System verifies the OTP
4. **Sets new password** - User enters and confirms new password
5. **Password updated** - User can now login with new password

## Testing

### Test the Email Service
1. Configure your email credentials in `.env`
2. Start the backend server
3. Check console for "Email service is ready to send messages"

### Test the Complete Flow
1. Start both backend and frontend servers
2. Go to login page
3. Click "Forgot Password?"
4. Enter a valid user's email address
5. Check email inbox for OTP
6. Complete the flow

## Email Service Alternatives

If Gmail doesn't work, you can use:
- **Outlook/Hotmail**: Change service to 'hotmail'
- **Yahoo**: Change service to 'yahoo'
- **Custom SMTP**: Replace service with host/port configuration

## Troubleshooting

### Common Issues:
1. **"Email service not configured"**: Check EMAIL_USER and EMAIL_PASS in .env
2. **"Invalid credentials"**: Verify app-specific password for Gmail
3. **"Network error"**: Check if backend server is running
4. **OTP not received**: Check spam folder, verify email configuration

### Debug Tips:
- Check backend console for email service status
- Verify .env file is loaded properly
- Test email configuration separately
- Check MongoDB connection for OTP storage

## Security Considerations

1. **OTP Expiration**: OTPs expire after 10 minutes
2. **One-time Use**: OTPs are cleared after successful password reset
3. **Password Strength**: Minimum 6 characters required
4. **Rate Limiting**: Consider adding rate limiting for OTP requests
5. **Audit Trail**: Consider logging password reset attempts

## Future Enhancements

1. **SMS OTP**: Add phone number verification
2. **Rate Limiting**: Prevent OTP spam
3. **Account Lockout**: Lock account after multiple failed attempts
4. **Email Verification**: Verify email ownership during registration
5. **Password Strength Meter**: Visual password strength indicator

## Files Modified/Created

### Backend:
- `models/User.js` - Added OTP fields
- `controllers/authController.js` - Added OTP functions
- `config/email.js` - Email configuration and templates
- `index.js` - Added new auth routes
- `.env` - Email configuration

### Frontend:
- `components/auth/ForgotPasswordFlow.jsx` - New component
- `components/auth/Login.jsx` - Added forgot password integration
- `.env` - EmailJS configuration
- `package.json` - Added @emailjs/browser

This implementation provides a secure, user-friendly forgot password system with proper error handling and professional email templates.
