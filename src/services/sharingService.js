/**
 * Sharing Service
 * Handles local sharing functionality for panels/dashboards
 */

class SharingService {
  constructor() {
    this.STORAGE_KEY = 'sharedPanels'
  }

  /**
   * Get all shared panels from localStorage
   * @returns {Object} Shared panels data
   */
  getSharedPanels() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.error('Error getting shared panels:', error)
      return {}
    }
  }

  /**
   * Save shared panels to localStorage
   * @param {Object} sharedPanels - Shared panels data to save
   */
  saveSharedPanels(sharedPanels) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sharedPanels))
    } catch (error) {
      console.error('Error saving shared panels:', error)
    }
  }

  /**
   * Share a panel
   * @param {Object} panel - Panel data to share
   * @param {Object} options - Sharing options
   * @returns {Object} Share data with link and password
   */
  sharePanel(panel, options = {}) {
    const shareableId = this.generateShareableId()
    const password = this.generatePassword()
    const baseUrl = window.location.origin
    const shareableLink = `${baseUrl}/shared/${shareableId}`

    // Get existing shared panels
    const sharedPanels = this.getSharedPanels()

    // Create share data
    const shareData = {
      id: shareableId,
      panelId: panel.id,
      panelName: panel.name,
      shareableLink,
      password,
      mode: options.mode || 'view',
      expiry: options.expiry || null,
      createdAt: new Date().toISOString(),
      createdBy: options.createdBy || 'Current User',
      panelData: {
        ...panel,
        widgets: panel.widgets || [],
        layouts: panel.layouts || panel.layout || {},
        deviceCount: panel.widgets?.length || 0,
        stats: panel.stats || { totalWidgets: panel.widgets?.length || 0, gridUtilization: 0 },
        sharePassword: password // Add password to panel data for SharedDashboardView
      }
    }

    // Store the shared panel
    sharedPanels[shareableId] = shareData
    this.saveSharedPanels(sharedPanels)

    return {
      success: true,
      shareData: {
        shareableId,
        shareableLink,
        password,
        mode: shareData.mode,
        expiry: shareData.expiry,
        createdAt: shareData.createdAt
      }
    }
  }

  /**
   * Get shared panel data by shareable ID
   * @param {string} shareableId - Shareable ID
   * @param {string} password - Access password (optional for now)
   * @returns {Object} Shared panel data or error
   */
  getSharedPanel(shareableId, password = null) {
    const sharedPanels = this.getSharedPanels()
    const shareData = sharedPanels[shareableId]
    
    if (!shareData) {
      return {
        success: false,
        error: 'Shared panel not found'
      }
    }

    // Check if expired
    if (shareData.expiry && new Date(shareData.expiry) < new Date()) {
      return {
        success: false,
        error: 'Shared panel has expired'
      }
    }

    // For now, we'll skip password validation to make it simpler
    // You can add password validation later if needed
    return {
      success: true,
      panel: shareData.panelData,
      shareInfo: {
        mode: shareData.mode,
        createdAt: shareData.createdAt,
        createdBy: shareData.createdBy
      }
    }
  }

  /**
   * Check if a panel is shared
   * @param {string} panelId - Panel ID
   * @returns {Object} Share information or null
   */
  isPanelShared(panelId) {
    const sharedPanels = this.getSharedPanels()
    
    for (const [shareableId, shareData] of Object.entries(sharedPanels)) {
      if (shareData.panelId === panelId) {
        return {
          shareableId,
          shareableLink: shareData.shareableLink,
          password: shareData.password,
          mode: shareData.mode,
          createdAt: shareData.createdAt
        }
      }
    }
    
    return null
  }

  /**
   * Unshare a panel
   * @param {string} panelId - Panel ID to unshare
   * @returns {boolean} Success status
   */
  unsharePanel(panelId) {
    const sharedPanels = this.getSharedPanels()
    let found = false
    
    for (const [shareableId, shareData] of Object.entries(sharedPanels)) {
      if (shareData.panelId === panelId) {
        delete sharedPanels[shareableId]
        found = true
        break
      }
    }
    
    if (found) {
      this.saveSharedPanels(sharedPanels)
      return true
    }
    
    return false
  }

  /**
   * Get all shared panels for a user
   * @param {string} userId - User ID
   * @returns {Array} Array of shared panels
   */
  getUserSharedPanels(userId) {
    const sharedPanels = this.getSharedPanels()
    const userSharedPanels = []
    
    for (const [shareableId, shareData] of Object.entries(sharedPanels)) {
      if (shareData.createdBy === userId) {
        userSharedPanels.push({
          shareableId,
          panelId: shareData.panelId,
          panelName: shareData.panelName,
          shareableLink: shareData.shareableLink,
          mode: shareData.mode,
          createdAt: shareData.createdAt,
          expiry: shareData.expiry
        })
      }
    }
    
    return userSharedPanels
  }

  /**
   * Generate a unique shareable ID
   * @returns {string} Shareable ID
   */
  generateShareableId() {
    return `panel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Generate a random password
   * @returns {string} Random password
   */
  generatePassword() {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  /**
   * Clean up expired shared panels
   * @returns {number} Number of panels cleaned up
   */
  cleanupExpiredPanels() {
    const sharedPanels = this.getSharedPanels()
    const now = new Date()
    let cleanedCount = 0
    
    for (const [shareableId, shareData] of Object.entries(sharedPanels)) {
      if (shareData.expiry && new Date(shareData.expiry) < now) {
        delete sharedPanels[shareableId]
        cleanedCount++
      }
    }
    
    if (cleanedCount > 0) {
      this.saveSharedPanels(sharedPanels)
    }
    
    return cleanedCount
  }
}

// Create and export a singleton instance
const sharingService = new SharingService()

// Clean up expired panels on initialization
sharingService.cleanupExpiredPanels()

export default sharingService
