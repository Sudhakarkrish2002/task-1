/**
 * Widget Data Service
 * Handles real-time data updates for widgets based on MQTT messages
 * Implements the data format: {template_id: {widget_id: data, widget_id: data}}
 */

class WidgetDataService {
  constructor() {
    this.dataCache = new Map() // Cache for widget data
    this.updateCallbacks = new Map() // Callbacks for widget updates
    this.connectionStatus = new Map() // Track widget connection status
  }

  /**
   * Process incoming MQTT data for a panel
   * @param {string} panelId - The panel ID (template ID)
   * @param {Object} panelData - The data object containing widget data
   */
  processPanelData(panelId, panelData) {
    console.log(`📊 Processing panel data for ${panelId}:`, panelData)

    if (!panelId || typeof panelData !== 'object') {
      console.error('❌ Invalid panel data format')
      return
    }

    // Process each widget in the panel
    Object.keys(panelData).forEach(widgetId => {
      const widgetData = panelData[widgetId]
      this.updateWidgetData(panelId, widgetId, widgetData)
    })
  }

  /**
   * Update data for a specific widget
   * @param {string} panelId - The panel ID
   * @param {string} widgetId - The widget ID
   * @param {*} data - The widget data
   */
  updateWidgetData(panelId, widgetId, data) {
    const key = `${panelId}:${widgetId}`
    
    // Store in cache
    this.dataCache.set(key, {
      data: data,
      timestamp: new Date().toISOString(),
      panelId,
      widgetId
    })

    // Update connection status
    this.connectionStatus.set(key, {
      isConnected: true,
      lastSeen: new Date().toISOString()
    })

    console.log(`🎯 Updated widget data for ${key}:`, data)

    // Trigger update callbacks
    this.triggerUpdateCallbacks(panelId, widgetId, data)
  }

  /**
   * Get cached data for a widget
   * @param {string} panelId - The panel ID
   * @param {string} widgetId - The widget ID
   * @returns {Object|null} The cached widget data
   */
  getWidgetData(panelId, widgetId) {
    const key = `${panelId}:${widgetId}`
    return this.dataCache.get(key) || null
  }

  /**
   * Get connection status for a widget
   * @param {string} panelId - The panel ID
   * @param {string} widgetId - The widget ID
   * @returns {Object} The connection status
   */
  getWidgetConnectionStatus(panelId, widgetId) {
    const key = `${panelId}:${widgetId}`
    return this.connectionStatus.get(key) || {
      isConnected: false,
      lastSeen: null
    }
  }

  /**
   * Register a callback for widget data updates
   * @param {string} panelId - The panel ID
   * @param {string} widgetId - The widget ID
   * @param {Function} callback - The callback function
   */
  onWidgetUpdate(panelId, widgetId, callback) {
    const key = `${panelId}:${widgetId}`
    
    if (!this.updateCallbacks.has(key)) {
      this.updateCallbacks.set(key, new Set())
    }
    
    this.updateCallbacks.get(key).add(callback)
  }

  /**
   * Unregister a callback for widget data updates
   * @param {string} panelId - The panel ID
   * @param {string} widgetId - The widget ID
   * @param {Function} callback - The callback function
   */
  offWidgetUpdate(panelId, widgetId, callback) {
    const key = `${panelId}:${widgetId}`
    
    if (this.updateCallbacks.has(key)) {
      this.updateCallbacks.get(key).delete(callback)
      
      // Clean up empty callback sets
      if (this.updateCallbacks.get(key).size === 0) {
        this.updateCallbacks.delete(key)
      }
    }
  }

  /**
   * Trigger update callbacks for a widget
   * @param {string} panelId - The panel ID
   * @param {string} widgetId - The widget ID
   * @param {*} data - The widget data
   */
  triggerUpdateCallbacks(panelId, widgetId, data) {
    const key = `${panelId}:${widgetId}`
    
    if (this.updateCallbacks.has(key)) {
      const callbacks = this.updateCallbacks.get(key)
      callbacks.forEach(callback => {
        try {
          callback(data, {
            panelId,
            widgetId,
            timestamp: new Date().toISOString()
          })
        } catch (error) {
          console.error(`❌ Error in widget update callback for ${key}:`, error)
        }
      })
    }
  }

  /**
   * Clear data for a specific panel
   * @param {string} panelId - The panel ID
   */
  clearPanelData(panelId) {
    const keysToDelete = []
    
    this.dataCache.forEach((value, key) => {
      if (value.panelId === panelId) {
        keysToDelete.push(key)
      }
    })

    keysToDelete.forEach(key => {
      this.dataCache.delete(key)
      this.connectionStatus.delete(key)
      this.updateCallbacks.delete(key)
    })

    console.log(`🧹 Cleared data for panel ${panelId}`)
  }

  /**
   * Get all data for a panel
   * @param {string} panelId - The panel ID
   * @returns {Object} Object containing all widget data for the panel
   */
  getPanelData(panelId) {
    const panelData = {}
    
    this.dataCache.forEach((value, key) => {
      if (value.panelId === panelId) {
        panelData[value.widgetId] = value.data
      }
    })

    return panelData
  }

  /**
   * Check if a widget has recent data (within last 30 seconds)
   * @param {string} panelId - The panel ID
   * @param {string} widgetId - The widget ID
   * @returns {boolean} True if widget has recent data
   */
  hasRecentData(panelId, widgetId) {
    const key = `${panelId}:${widgetId}`
    const cached = this.dataCache.get(key)
    
    if (!cached) return false
    
    const now = new Date()
    const dataTime = new Date(cached.timestamp)
    const diffSeconds = (now - dataTime) / 1000
    
    return diffSeconds <= 30 // Consider data recent if within 30 seconds
  }

  /**
   * Get service statistics
   * @returns {Object} Service statistics
   */
  getStats() {
    return {
      totalWidgets: this.dataCache.size,
      totalCallbacks: Array.from(this.updateCallbacks.values()).reduce((sum, set) => sum + set.size, 0),
      connectedWidgets: Array.from(this.connectionStatus.values()).filter(status => status.isConnected).length
    }
  }
}

// Create singleton instance
const widgetDataService = new WidgetDataService()

// Make it available globally
if (typeof window !== 'undefined') {
  window.widgetDataService = widgetDataService
}

export default widgetDataService
