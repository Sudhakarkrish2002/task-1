# Email Setup Guide for IoT Dashboard

This guide will help you set up real email functionality for the forgot password feature.

## 🚀 Quick Setup (Recommended)

### Option 1: EmailJS (Easiest - No Backend Required)

1. **Create EmailJS Account**
   - Go to [https://www.emailjs.com/](https://www.emailjs.com/)
   - Sign up for a free account
   - Free tier includes 200 emails/month

2. **Set Up Email Service**
   - Go to "Email Services" in your dashboard
   - Click "Add New Service"
   - Choose your email provider (Gmail, Outlook, etc.)
   - Follow the setup instructions for your provider

3. **Create Email Template**
   - Go to "Email Templates"
   - Click "Create New Template"
   - Use this template content:

   **Subject:** `Password Reset - IoT Dashboard`

   **Content:**
   ```
   Hello!

   You requested a password reset for your IoT Dashboard account.

   Click the link below to reset your password:
   {{reset_link}}

   This link will expire in 24 hours.

   If you didn't request this reset, please ignore this email.

   Best regards,
   IoT Dashboard Team
   ```

4. **Get Your Credentials**
   - Note down your **Service ID**
   - Note down your **Template ID**
   - Note down your **Public Key**

5. **Update Configuration**
   - Open `src/config/emailConfig.js`
   - Update the `emailjs` section:
   ```javascript
   emailjs: {
     serviceId: 'your_service_id_here',
     templateId: 'your_template_id_here',
     publicKey: 'your_public_key_here',
     enabled: true
   }
   ```

6. **Test the Setup**
   - Start your application
   - Go to the forgot password page
   - Enter a valid email address
   - Check if you receive the reset email

## 🔧 Alternative Setup Options

### Option 2: SMTP with Backend

If you prefer to use SMTP directly, you'll need to set up a backend server:

1. **Set up a backend server** (Node.js, Python, etc.)
2. **Install email library** (nodemailer, sendgrid, etc.)
3. **Create API endpoint** for sending emails
4. **Update configuration** in `emailConfig.js`

### Option 3: Third-party Services

You can also use services like:
- **SendGrid**
- **AWS SES**
- **Mailgun**
- **Postmark**

## 📧 Email Template Variables

The email template supports these variables:
- `{{to_email}}` - Recipient's email address
- `{{reset_link}}` - Password reset link
- `{{app_name}}` - Application name
- `{{from_name}}` - Sender name

## 🛠️ Configuration Options

### Enable/Disable Email Methods

In `src/config/emailConfig.js`, you can enable/disable different methods:

```javascript
export const emailConfig = {
  emailjs: {
    enabled: true  // Set to false to disable EmailJS
  },
  smtp: {
    enabled: false  // Set to true to enable SMTP
  },
  api: {
    enabled: false  // Set to true to enable API
  },
  fallback: {
    enabled: true  // Always enabled as fallback
  }
}
```

### Fallback Methods

If email sending fails, the system will automatically fall back to:
1. **Clipboard** - Copy reset link to clipboard
2. **Mailto** - Open email client with pre-filled content

## 🧪 Testing

### Test Email Sending
1. Go to forgot password page
2. Enter a valid email address
3. Click "Send Reset Link"
4. Check your email inbox (including spam folder)

### Test Fallback Methods
1. Disable email services in config
2. Try forgot password flow
3. Verify fallback methods work

## 🔒 Security Notes

- Reset tokens expire after 24 hours
- Tokens are single-use (deleted after successful reset)
- Email addresses are validated before sending
- All email content is sanitized

## 🆘 Troubleshooting

### Common Issues

1. **Email not received**
   - Check spam folder
   - Verify email service configuration
   - Check browser console for errors

2. **EmailJS not working**
   - Verify Service ID, Template ID, and Public Key
   - Check if EmailJS script is loaded
   - Ensure email service is properly configured

3. **Fallback methods not working**
   - Check if clipboard API is available
   - Verify mailto links work in your browser

### Debug Mode

Enable debug logging by opening browser console and looking for:
- EmailJS initialization messages
- Email sending success/error messages
- Fallback method activations

## 📞 Support

If you need help setting up email functionality:
1. Check the browser console for error messages
2. Verify your email service configuration
3. Test with a simple email first
4. Contact support if issues persist

---

**Note:** This setup guide assumes you're using the default configuration. For production use, consider using environment variables for sensitive credentials.
