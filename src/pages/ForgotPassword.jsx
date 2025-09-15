import React, { useState, useEffect, startTransition } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')
  const [emailMethod, setEmailMethod] = useState('email')
  const [resetLink, setResetLink] = useState('')

  const { requestPasswordReset } = useAuth()
  const { showError, showSuccess } = useToast()
  const navigate = useNavigate()

  // Redirect if already authenticated
  useEffect(() => {
    const authData = JSON.parse(localStorage.getItem('authData') || 'null')
    if (authData && authData.user) {
      startTransition(() => {
        navigate('/dashboard', { replace: true })
      })
    }
  }, [navigate])

  const validateForm = () => {
    const newErrors = {}

    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setErrors({})
    setSuccessMessage('')

    try {
      const result = await requestPasswordReset(email)
      console.log('Password reset result:', JSON.stringify(result, null, 2)) // Better debug log
      console.log('Result success:', result.success)
      console.log('Result message:', result.message)
      console.log('Result method:', result.method)
      console.log('Result resetLink:', result.resetLink)
      
      if (result.success) {
        setIsEmailSent(true)
        setSuccessMessage(result.message || 'Password reset link sent successfully')
        setEmailMethod(result.method || 'email')
        setResetLink(result.resetLink || '')
        showSuccess(result.message || 'Password reset link sent successfully')
      } else {
        const errorMsg = result.message || 'Failed to send reset email'
        setErrors({ general: errorMsg })
        showError(errorMsg)
      }
    } catch (error) {
      console.error('Password reset error:', error) // Debug log
      const errorMessage = 'Failed to send reset email. Please try again.'
      setErrors({ general: errorMessage })
      showError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendEmail = async () => {
    setIsLoading(true)
    setErrors({})
    
    try {
      const result = await requestPasswordReset(email)
      
      if (result.success) {
        showSuccess('Reset email sent again!')
      } else {
        showError(result.message)
      }
    } catch (error) {
      showError('Failed to resend email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>

            {/* Success Message */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Check Your Email
              </h1>
              <p className="text-gray-600 mb-4">
                We've sent a password reset link to:
              </p>
              <p className="text-sm font-medium text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                {email}
              </p>
            </div>

            {/* Fallback Reset Link */}
            {emailMethod === 'fallback' && resetLink && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-yellow-800 mb-2">Reset Link:</h3>
                <p className="text-sm text-yellow-700 mb-2">
                  Email sending failed. Please use the link below to reset your password:
                </p>
                <div className="bg-white p-3 rounded border">
                  <p className="text-xs text-gray-600 break-all">{resetLink}</p>
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(resetLink)}
                  className="mt-2 text-sm text-yellow-800 hover:text-yellow-900 underline"
                >
                  Copy Link
                </button>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Next Steps:</h3>
              <ol className="text-sm text-gray-600 space-y-1">
                {emailMethod === 'email' ? (
                  <>
                    <li>1. Check your email inbox (including spam folder)</li>
                    <li>2. Click the reset link in the email</li>
                    <li>3. Create a new password</li>
                    <li>4. Sign in with your new password</li>
                  </>
                ) : (
                  <>
                    <li>1. Use the reset link provided above</li>
                    <li>2. Create a new password</li>
                    <li>3. Sign in with your new password</li>
                  </>
                )}
              </ol>
            </div>

            {/* Resend Email */}
            <div className="text-center mb-6">
              <p className="text-sm text-gray-600 mb-3">
                Didn't receive the email?
              </p>
              <button
                type="button"
                onClick={handleResendEmail}
                disabled={isLoading}
                className="text-red-600 hover:text-red-500 text-sm font-medium underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Sending...' : 'Resend Email'}
              </button>
            </div>

            {/* Back to Sign In */}
            <div className="text-center">
              <Link
                to="/signin"
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Mail className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Forgot Password?
            </h1>
            <p className="text-gray-600">
              No worries! Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">{successMessage}</p>
            </div>
          )}

          {/* General Error */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{errors.general}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                  errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                style={{
                  outline: 'none',
                  boxShadow: 'none',
                  borderColor: errors.email ? '#fca5a5' : '#d1d5db'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#dc2626'
                  e.target.style.boxShadow = '0 0 0 2px rgba(220, 38, 38, 0.2)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.email ? '#fca5a5' : '#d1d5db'
                  e.target.style.boxShadow = 'none'
                }}
                onMouseEnter={(e) => {
                  if (!e.target.matches(':focus')) {
                    e.target.style.borderColor = '#fca5a5'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.target.matches(':focus')) {
                    e.target.style.borderColor = errors.email ? '#fca5a5' : '#d1d5db'
                  }
                }}
                placeholder="Enter your email address"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending Reset Link...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          {/* Back to Sign In */}
          <div className="mt-6 text-center">
            <Link
              to="/signin"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
