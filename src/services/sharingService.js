/**
 * Sharing Service for Panel Sharing Functionality
 * Handles API calls for sharing panels with users
 */

class SharingService {
  constructor() {
    // Handle environment variables for both Vite and Create React App
    let apiUrl = 'http://localhost:3001/api'
    
    // Try Vite environment variable first
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      apiUrl = import.meta.env.VITE_API_URL || apiUrl
    }
    // Fallback to process.env for Create React App
    else if (typeof process !== 'undefined' && process.env) {
      apiUrl = process.env.REACT_APP_API_URL || apiUrl
    }
    
    this.baseURL = apiUrl
  }

  /**
   * Share a panel with users
   * @param {string} panelId - Panel ID
   * @param {Array} users - Array of users to share with
   * @returns {Promise<Object>} - API response
   */
  async sharePanel(panelId, users) {
    try {
      const response = await fetch(`${this.baseURL}/panels/${panelId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          users: users,
          sharedAt: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error sharing panel:', error)
      throw error
    }
  }

  /**
   * Update user permissions for a shared panel
   * @param {string} panelId - Panel ID
   * @param {string} userId - User ID
   * @param {string} permission - New permission level
   * @returns {Promise<Object>} - API response
   */
  async updateUserPermission(panelId, userId, permission) {
    try {
      const response = await fetch(`${this.baseURL}/panels/${panelId}/users/${userId}/permission`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          permission: permission,
          updatedAt: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error updating user permission:', error)
      throw error
    }
  }

  /**
   * Remove user from shared panel
   * @param {string} panelId - Panel ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} - API response
   */
  async removeUserFromPanel(panelId, userId) {
    try {
      const response = await fetch(`${this.baseURL}/panels/${panelId}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error removing user from panel:', error)
      throw error
    }
  }

  /**
   * Get shared users for a panel
   * @param {string} panelId - Panel ID
   * @returns {Promise<Array>} - Array of shared users
   */
  async getSharedUsers(panelId) {
    try {
      const response = await fetch(`${this.baseURL}/panels/${panelId}/users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error fetching shared users:', error)
      throw error
    }
  }

  /**
   * Generate share link for a panel
   * @param {string} panelId - Panel ID
   * @param {Object} options - Share options
   * @returns {Promise<Object>} - Share link data
   */
  async generateShareLink(panelId, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}/panels/${panelId}/share-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          expiresAt: options.expiresAt,
          requireAuth: options.requireAuth || false,
          allowEdit: options.allowEdit || false
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error generating share link:', error)
      throw error
    }
  }

  /**
   * Validate user input (email or username)
   * @param {string} input - User input
   * @param {string} type - Input type ('email' or 'username')
   * @returns {Promise<Object>} - Validation result
   */
  async validateUserInput(input, type) {
    try {
      const response = await fetch(`${this.baseURL}/users/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          input: input,
          type: type
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error validating user input:', error)
      // Fallback to client-side validation
      return this.clientSideValidation(input, type)
    }
  }

  /**
   * Client-side validation fallback
   * @param {string} input - User input
   * @param {string} type - Input type
   * @returns {Object} - Validation result
   */
  clientSideValidation(input, type) {
    const errors = []
    
    if (!input.trim()) {
      errors.push('This field is required')
    }
    
    if (type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(input)) {
        errors.push('Please enter a valid email address')
      }
    } else if (type === 'username') {
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
      if (!usernameRegex.test(input)) {
        errors.push('Username must be 3-20 characters, letters, numbers, and underscores only')
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors,
      user: errors.length === 0 ? {
        email: type === 'email' ? input : '',
        username: type === 'username' ? input : '',
        name: type === 'email' ? input.split('@')[0] : input
      } : null
    }
  }

  /**
   * Get authentication token from localStorage
   * @returns {string} - Auth token
   */
  getAuthToken() {
    return localStorage.getItem('authToken') || ''
  }

  /**
   * Send sharing notification to user
   * @param {string} userId - User ID
   * @param {string} panelId - Panel ID
   * @param {string} permission - Permission level
   * @returns {Promise<Object>} - API response
   */
  async sendSharingNotification(userId, panelId, permission) {
    try {
      const response = await fetch(`${this.baseURL}/notifications/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          userId: userId,
          panelId: panelId,
          permission: permission,
          sentAt: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error sending sharing notification:', error)
      throw error
    }
  }
}

// Create and export a singleton instance
const sharingService = new SharingService()
export default sharingService
