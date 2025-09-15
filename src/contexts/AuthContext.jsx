import { createContext, useContext, useState, useEffect, useCallback, startTransition } from 'react'
import { useNavigate } from 'react-router-dom'
import UserService from '../services/userService'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Authentication service
class AuthService {
  static TOKEN_KEY = 'iot_dashboard_token'
  static USER_KEY = 'iot_dashboard_user'
  static SESSION_TIMEOUT = 24 * 60 * 60 * 1000 // 24 hours

  // Generate a simple token (in production, this would come from your backend)
  static generateToken() {
    return btoa(JSON.stringify({
      timestamp: Date.now(),
      random: Math.random().toString(36).substring(2)
    }))
  }

  // Store authentication data
  static setAuthData(user, token) {
    const authData = {
      user,
      token,
      timestamp: Date.now()
    }
    
    try {
      localStorage.setItem(this.TOKEN_KEY, token)
      localStorage.setItem(this.USER_KEY, JSON.stringify(authData))
      return true
    } catch (error) {
      console.error('Error storing auth data:', error)
      return false
    }
  }

  // Get authentication data
  static getAuthData() {
    try {
      const userData = localStorage.getItem(this.USER_KEY)
      const token = localStorage.getItem(this.TOKEN_KEY)
      
      if (!userData || !token) {
        return null
      }

      const authData = JSON.parse(userData)
      
      // Check if session has expired
      if (Date.now() - authData.timestamp > this.SESSION_TIMEOUT) {
        this.clearAuthData()
        return null
      }

      return authData
    } catch (error) {
      console.error('Error retrieving auth data:', error)
      this.clearAuthData()
      return null
    }
  }

  // Clear authentication data
  static clearAuthData() {
    localStorage.removeItem(this.TOKEN_KEY)
    localStorage.removeItem(this.USER_KEY)
  }

  // Validate credentials (in production, this would be an API call)
  static async validateCredentials(email, password) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Demo credentials
    if (email === 'demo@iot.com' && password === 'demo123') {
      return {
        success: true,
        user: {
          id: 'demo-user-1',
          email: 'demo@iot.com',
          name: 'Demo User',
          role: 'admin',
          avatar: null
        }
      }
    }

    // Allow any email/password for demo purposes (remove in production)
    if (email && password && email.includes('@')) {
      return {
        success: true,
        user: {
          id: `user-${Date.now()}`,
          email: email,
          name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          role: 'user',
          avatar: null
        }
      }
    }

    return {
      success: false,
      error: 'Invalid email or password'
    }
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const navigate = useNavigate()

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const authData = AuthService.getAuthData()
        
        if (authData) {
          setUser(authData.user)
          setIsAuthenticated(true)
          console.log('User authenticated:', authData.user.email)
        } else {
          setUser(null)
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        setUser(null)
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  // Login function
  const login = useCallback(async (email, password) => {
    try {
      setIsLoading(true)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const result = UserService.authenticateUser(email, password)
      
      if (result.success) {
        const token = AuthService.generateToken()
        const success = AuthService.setAuthData(result.user, token)
        
        if (success) {
          setUser(result.user)
          setIsAuthenticated(true)
          return { success: true }
        } else {
          return { success: false, error: 'Failed to save authentication data' }
        }
      } else {
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Logout function
  const logout = useCallback(() => {
    try {
      AuthService.clearAuthData()
      setUser(null)
      setIsAuthenticated(false)
      startTransition(() => {
        navigate('/signin', { replace: true })
      })
      return { success: true }
    } catch (error) {
      console.error('Logout error:', error)
      return { success: false, error: 'Failed to logout' }
    }
  }, [navigate])

  // Check if user is authenticated
  const checkAuth = useCallback(() => {
    const authData = AuthService.getAuthData()
    if (authData) {
      setUser(authData.user)
      setIsAuthenticated(true)
      return true
    } else {
      setUser(null)
      setIsAuthenticated(false)
      return false
    }
  }, [])

  // Register function
  const register = useCallback(async (userData) => {
    try {
      setIsLoading(true)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const result = UserService.registerUser(userData)
      
      if (result.success) {
        return { success: true, user: result.user }
      } else {
        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: 'An unexpected error occurred during registration' }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Refresh user data (for future use)
  const refreshUser = useCallback(async () => {
    // In production, this would fetch fresh user data from the API
    const authData = AuthService.getAuthData()
    if (authData) {
      setUser(authData.user)
      return { success: true }
    }
    return { success: false }
  }, [])

  // Request password reset
  const requestPasswordReset = useCallback(async (email) => {
    try {
      setIsLoading(true)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const result = await UserService.requestPasswordReset(email)
      console.log('AuthContext: UserService result:', JSON.stringify(result, null, 2))
      
      if (result.success) {
        const authResult = { 
          success: true, 
          message: result.message,
          method: result.method,
          resetLink: result.resetLink,
          email: result.email
        }
        console.log('AuthContext: Returning success result:', JSON.stringify(authResult, null, 2))
        return authResult
      } else {
        const errorResult = { success: false, message: result.error }
        console.log('AuthContext: Returning error result:', JSON.stringify(errorResult, null, 2))
        return errorResult
      }
    } catch (error) {
      console.error('Password reset request error:', error)
      return { success: false, message: 'An unexpected error occurred' }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Reset password with token
  const resetPassword = useCallback(async (token, email, newPassword) => {
    try {
      setIsLoading(true)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const result = await UserService.resetPasswordWithToken(token, email, newPassword)
      
      if (result.success) {
        return { 
          success: true, 
          message: result.message
        }
      } else {
        return { success: false, message: result.error }
      }
    } catch (error) {
      console.error('Password reset error:', error)
      return { success: false, message: 'An unexpected error occurred' }
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Validate reset token
  const validateResetToken = useCallback(async (token, email) => {
    try {
      const result = await UserService.validateResetToken(token, email)
      return result
    } catch (error) {
      console.error('Token validation error:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }, [])

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuth,
    refreshUser,
    requestPasswordReset,
    resetPassword,
    validateResetToken
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
