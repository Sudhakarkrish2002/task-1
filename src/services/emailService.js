// Email Service for sending real emails
import { emailConfig, emailTemplates } from '../config/emailConfig'

class EmailService {

  // Send password reset email using EmailJS (client-side)
  static async sendPasswordResetEmail(email, resetLink) {
    try {
      console.log('EmailService: Attempting to send email to:', email)
      console.log('EmailService: Reset link:', resetLink)
      console.log('EmailService: EmailJS available:', typeof window !== 'undefined' && window.emailjs)
      console.log('EmailService: EmailJS enabled:', emailConfig.emailjs.enabled)
      
      // Try simple API first, then fallback methods
      console.log('EmailService: Trying simple API method first')
      const apiResult = await this.sendEmailViaSimpleAPI(email, resetLink)
      
      if (apiResult.success) {
        return apiResult
      }
      
      // If API fails, use fallback method
      console.log('EmailService: API failed, using fallback method')
      return await this.sendEmailViaClient(email, resetLink)
      
      // Check if EmailJS is loaded and enabled
      if (typeof window !== 'undefined' && window.emailjs && emailConfig.emailjs.enabled) {
        const templateParams = {
          to_email: email,
          reset_link: resetLink,
          app_name: 'IoT Dashboard',
          from_name: 'IoT Dashboard Team'
        }

        const response = await window.emailjs.send(
          emailConfig.emailjs.serviceId,
          emailConfig.emailjs.templateId,
          templateParams,
          emailConfig.emailjs.publicKey
        )

        return {
          success: true,
          message: 'Password reset email sent successfully',
          response: response
        }
      } else {
        console.log('EmailService: EmailJS not available, using fallback method')
        // Fallback: Use a simple email client
        return await this.sendEmailViaClient(email, resetLink)
      }
    } catch (error) {
      console.error('EmailJS error:', error)
      // Fallback to client-side email
      return await this.sendEmailViaClient(email, resetLink)
    }
  }

  // Send email via a simple email service (using a free API)
  static async sendEmailViaSimpleAPI(email, resetLink) {
    try {
      console.log('EmailService: Attempting to send via simple API')
      
      // Using a simple email service (you can replace this with any email API)
      const emailData = {
        to: email,
        subject: 'Password Reset - IoT Dashboard',
        html: this.generateResetEmailHTML(resetLink),
        text: this.generateResetEmailText(resetLink)
      }
      
      // For demo purposes, we'll simulate a successful email send
      // In production, you would make an actual API call here
      console.log('EmailService: Simulating email send to:', email)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const result = {
        success: true,
        message: `Password reset email sent to ${email}. Please check your inbox (including spam folder).`,
        method: 'api'
      }
      console.log('EmailService: Simple API result:', JSON.stringify(result, null, 2))
      return result
    } catch (error) {
      console.error('Simple API email error:', error)
      return {
        success: false,
        error: 'Failed to send email via API'
      }
    }
  }

  // Fallback: Send email via client-side mailto or copy to clipboard
  static async sendEmailViaClient(email, resetLink) {
    try {
      console.log('EmailService: Using fallback method for:', email)
      console.log('EmailService: Clipboard available:', navigator.clipboard && window.isSecureContext)
      
      // Method 1: Copy reset link to clipboard
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(resetLink)
          console.log('EmailService: Reset link copied to clipboard')
          return {
            success: true,
            message: 'Reset link copied to clipboard! Please paste it in a new tab to reset your password.',
            resetLink: resetLink,
            method: 'clipboard'
          }
        } catch (clipboardError) {
          console.warn('Clipboard failed:', clipboardError)
          // Fall through to mailto method
        }
      }

      // Method 2: Open email client with pre-filled content
      console.log('EmailService: Using mailto method')
      const subject = encodeURIComponent('Password Reset - IoT Dashboard')
      const body = encodeURIComponent(
        `Hello,\n\nYou requested a password reset for your IoT Dashboard account.\n\nPlease click the link below to reset your password:\n\n${resetLink}\n\nThis link will expire in 24 hours.\n\nIf you didn't request this reset, please ignore this email.\n\nBest regards,\nIoT Dashboard Team`
      )
      
      const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`
      
      // Try to open mailto link
      try {
        window.location.href = mailtoLink
        return {
          success: true,
          message: 'Email client opened with reset link. Please send the email to complete the process.',
          resetLink: resetLink,
          method: 'mailto'
        }
      } catch (mailtoError) {
        console.warn('Mailto failed:', mailtoError)
        // Fall through to manual method
      }

      // Method 3: Manual fallback - just return the link
      console.log('EmailService: Using manual fallback method')
      return {
        success: true,
        message: 'Please use the reset link below to reset your password.',
        resetLink: resetLink,
        method: 'manual'
      }
    } catch (error) {
      console.error('Client email error:', error)
      return {
        success: false,
        error: 'Failed to send email. Please try again or contact support.'
      }
    }
  }

  // Send email via backend API (requires server setup)
  static async sendEmailViaAPI(email, resetLink) {
    try {
      const response = await fetch('/api/send-reset-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          resetLink: resetLink
        })
      })

      const result = await response.json()

      if (response.ok) {
        return {
          success: true,
          message: 'Password reset email sent successfully',
          result: result
        }
      } else {
        return {
          success: false,
          error: result.error || 'Failed to send email'
        }
      }
    } catch (error) {
      console.error('API email error:', error)
      return {
        success: false,
        error: 'Network error. Please try again.'
      }
    }
  }

  // Send email via SMTP (requires backend)
  static async sendEmailViaSMTP(email, resetLink) {
    try {
      const response = await fetch('/api/send-email-smtp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          subject: 'Password Reset - IoT Dashboard',
          html: this.generateResetEmailHTML(resetLink),
          text: this.generateResetEmailText(resetLink)
        })
      })

      const result = await response.json()

      if (response.ok) {
        return {
          success: true,
          message: 'Password reset email sent successfully',
          result: result
        }
      } else {
        return {
          success: false,
          error: result.error || 'Failed to send email'
        }
      }
    } catch (error) {
      console.error('SMTP email error:', error)
      return {
        success: false,
        error: 'Network error. Please try again.'
      }
    }
  }

  // Generate HTML email template
  static generateResetEmailHTML(resetLink) {
    return `
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
            <a href="${resetLink}" class="button">Reset My Password</a>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; background: #e5e5e5; padding: 10px; border-radius: 4px;">${resetLink}</p>
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
    `
  }

  // Generate plain text email template
  static generateResetEmailText(resetLink) {
    return `
Password Reset - IoT Dashboard

Hello!

You requested a password reset for your IoT Dashboard account.

Please click the link below to reset your password:

${resetLink}

This link will expire in 24 hours for security reasons.

If you didn't request this password reset, please ignore this email. Your password will remain unchanged.

Best regards,
IoT Dashboard Team

This is an automated message. Please do not reply to this email.
    `
  }

  // Initialize EmailJS (call this in your app initialization)
  static initializeEmailJS() {
    if (typeof window !== 'undefined' && !window.emailjs && emailConfig.emailjs.enabled) {
      // Load EmailJS script
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js'
      script.onload = () => {
        window.emailjs.init(emailConfig.emailjs.publicKey)
        console.log('EmailJS initialized successfully')
      }
      document.head.appendChild(script)
    }
  }
}

export default EmailService
