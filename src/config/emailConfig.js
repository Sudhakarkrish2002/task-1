// Email Configuration
// This file contains configuration for different email services

export const emailConfig = {
  // EmailJS Configuration (Recommended for client-side)
  emailjs: {
    serviceId: 'service_iot_dashboard', // Replace with your EmailJS service ID
    templateId: 'template_password_reset', // Replace with your EmailJS template ID
    publicKey: 'your_emailjs_public_key', // Replace with your EmailJS public key
    enabled: false // Disabled until properly configured
  },

  // SMTP Configuration (Requires backend)
  smtp: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'your-email@gmail.com', // Replace with your email
      pass: 'your-app-password' // Replace with your app password
    },
    enabled: false // Set to true to enable SMTP (requires backend)
  },

  // API Configuration (Requires backend)
  api: {
    endpoint: '/api/send-reset-email',
    enabled: false // Set to true to enable API email sending
  },

  // Fallback Configuration
  fallback: {
    enabled: true, // Always enabled as fallback
    methods: ['clipboard', 'mailto'] // Available fallback methods
  }
}

// Email Templates
export const emailTemplates = {
  passwordReset: {
    subject: 'Password Reset - IoT Dashboard',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset - IoT Dashboard</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hello!</h2>
            <p>You requested a password reset for your IoT Dashboard account.</p>
            <p>Click the button below to reset your password:</p>
            <a href="{{resetLink}}" class="button">Reset My Password</a>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; background: #e5e5e5; padding: 10px; border-radius: 4px;">{{resetLink}}</p>
            <p><strong>Important:</strong> This link will expire in 24 hours for security reasons.</p>
            <p>If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
          </div>
          <div class="footer">
            <p>Best regards,<br>IoT Dashboard Team</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Password Reset - IoT Dashboard

Hello!

You requested a password reset for your IoT Dashboard account.

Please click the link below to reset your password:

{{resetLink}}

This link will expire in 24 hours for security reasons.

If you didn't request this password reset, please ignore this email. Your password will remain unchanged.

Best regards,
IoT Dashboard Team

This is an automated message. Please do not reply to this email.
    `
  }
}

// Setup Instructions
export const setupInstructions = {
  emailjs: {
    title: 'EmailJS Setup (Recommended)',
    steps: [
      '1. Go to https://www.emailjs.com/',
      '2. Create a free account',
      '3. Create a new service (Gmail, Outlook, etc.)',
      '4. Create an email template with variables: {{to_email}}, {{reset_link}}',
      '5. Get your Service ID, Template ID, and Public Key',
      '6. Update the emailConfig.js file with your credentials',
      '7. The EmailJS script will be automatically loaded'
    ],
    benefits: [
      'Free tier available',
      'No backend required',
      'Easy to set up',
      'Works with any email provider'
    ]
  },
  smtp: {
    title: 'SMTP Setup (Requires Backend)',
    steps: [
      '1. Set up a backend server (Node.js, Python, etc.)',
      '2. Install email library (nodemailer, sendgrid, etc.)',
      '3. Configure SMTP settings',
      '4. Create API endpoint for sending emails',
      '5. Update the API endpoint in emailConfig.js'
    ],
    benefits: [
      'Full control over email sending',
      'Can use any SMTP provider',
      'Better for high volume',
      'More secure'
    ]
  }
}

export default emailConfig
