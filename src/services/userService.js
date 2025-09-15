// User Management Service
// EmailService no longer needed - using backend API

class UserService {
  static USERS_KEY = 'iot_dashboard_users'
  static CURRENT_USER_KEY = 'iot_dashboard_current_user'

  // Get all registered users
  static getUsers() {
    try {
      const users = localStorage.getItem(this.USERS_KEY)
      return users ? JSON.parse(users) : []
    } catch (error) {
      console.error('Error getting users:', error)
      return []
    }
  }

  // Save all users
  static saveUsers(users) {
    try {
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users))
      return true
    } catch (error) {
      console.error('Error saving users:', error)
      return false
    }
  }

  // Check if user exists
  static userExists(email) {
    const users = this.getUsers()
    return users.some(user => user.email.toLowerCase() === email.toLowerCase())
  }

  // Register a new user
  static registerUser(userData) {
    try {
      const users = this.getUsers()
      
      // Check if user already exists
      if (this.userExists(userData.email)) {
        return {
          success: false,
          error: 'User with this email already exists'
        }
      }

      // Validate user data
      const validation = this.validateUserData(userData)
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error
        }
      }

      // Create new user
      const newUser = {
        id: `user-${Date.now()}-${Math.random().toString(36).substring(2)}`,
        email: userData.email.toLowerCase(),
        name: userData.name,
        password: userData.password, // In production, this should be hashed
        role: 'user',
        createdAt: new Date().toISOString(),
        lastLogin: null,
        isActive: true
      }

      // Add user to the list
      users.push(newUser)
      
      // Save users
      if (this.saveUsers(users)) {
        return {
          success: true,
          user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role
          }
        }
      } else {
        return {
          success: false,
          error: 'Failed to save user data'
        }
      }
    } catch (error) {
      console.error('Registration error:', error)
      return {
        success: false,
        error: 'An unexpected error occurred during registration'
      }
    }
  }

  // Authenticate user
  static authenticateUser(email, password) {
    try {
      const users = this.getUsers()
      const user = users.find(u => 
        u.email.toLowerCase() === email.toLowerCase() && 
        u.password === password &&
        u.isActive
      )

      if (user) {
        // Update last login
        user.lastLogin = new Date().toISOString()
        this.saveUsers(users)

        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          }
        }
      } else {
        // Check if user exists but wrong password
        const userExists = this.userExists(email)
        if (userExists) {
          return {
            success: false,
            error: 'Invalid password'
          }
        } else {
          return {
            success: false,
            error: 'User not found. Please sign up first.'
          }
        }
      }
    } catch (error) {
      console.error('Authentication error:', error)
      return {
        success: false,
        error: 'An unexpected error occurred during authentication'
      }
    }
  }

  // Validate user data
  static validateUserData(userData) {
    const { email, password, name } = userData

    if (!email || !password || !name) {
      return {
        isValid: false,
        error: 'All fields are required'
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return {
        isValid: false,
        error: 'Please enter a valid email address'
      }
    }

    // Password validation
    if (password.length < 6) {
      return {
        isValid: false,
        error: 'Password must be at least 6 characters long'
      }
    }

    // Name validation
    if (name.trim().length < 2) {
      return {
        isValid: false,
        error: 'Name must be at least 2 characters long'
      }
    }

    return {
      isValid: true
    }
  }

  // Get user by ID
  static getUserById(userId) {
    const users = this.getUsers()
    return users.find(user => user.id === userId)
  }

  // Update user profile
  static updateUser(userId, updates) {
    try {
      const users = this.getUsers()
      const userIndex = users.findIndex(user => user.id === userId)
      
      if (userIndex === -1) {
        return {
          success: false,
          error: 'User not found'
        }
      }

      // Update user data
      users[userIndex] = {
        ...users[userIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      }

      if (this.saveUsers(users)) {
        return {
          success: true,
          user: {
            id: users[userIndex].id,
            email: users[userIndex].email,
            name: users[userIndex].name,
            role: users[userIndex].role
          }
        }
      } else {
        return {
          success: false,
          error: 'Failed to update user data'
        }
      }
    } catch (error) {
      console.error('Update user error:', error)
      return {
        success: false,
        error: 'An unexpected error occurred'
      }
    }
  }

  // Request password reset - now uses real backend API
  static async requestPasswordReset(email) {
    try {
      const response = await fetch('http://localhost:5000/api/auth/request-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      })

      const result = await response.json()
      console.log('UserService: Backend API result:', JSON.stringify(result, null, 2))
      
      if (result.success) {
        return {
          success: true,
          message: result.message,
          email: result.email,
          method: 'email'
        }
      } else {
        return {
          success: false,
          error: result.error
        }
      }
    } catch (error) {
      console.error('Password reset request error:', error)
      return {
        success: false,
        error: 'Failed to connect to server. Please check your internet connection and try again.'
      }
    }
  }

  // Reset password with token - now uses real backend API
  static async resetPasswordWithToken(token, email, newPassword) {
    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, email, newPassword })
      })

      const result = await response.json()
      console.log('UserService: Reset password API result:', JSON.stringify(result, null, 2))
      
      return result
    } catch (error) {
      console.error('Password reset error:', error)
      return {
        success: false,
        error: 'Failed to connect to server. Please check your internet connection and try again.'
      }
    }
  }

  // Validate reset token - now uses real backend API
  static async validateResetToken(token, email) {
    try {
      const response = await fetch(`http://localhost:5000/api/auth/validate-reset-token?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const result = await response.json()
      console.log('UserService: Validate token API result:', JSON.stringify(result, null, 2))
      
      return result
    } catch (error) {
      console.error('Token validation error:', error)
      return {
        success: false,
        error: 'Failed to connect to server. Please check your internet connection and try again.'
      }
    }
  }

}

export default UserService
