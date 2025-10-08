import mqttService from './mqttService'

/**
 * Live Data Service for Shared Dashboards
 * Handles real-time data streaming for IoT dashboard widgets
 */
class LiveDataService {
  constructor() {
    this.subscriptions = new Map() // topic -> Set of handlers
    this.widgetData = new Map() // widgetId -> data
    this.connectionStatus = {
      isConnected: false,
      lastConnected: null,
      reconnectAttempts: 0
    }
    this.dataValidation = {
      enabled: true,
      maxValue: 1000,
      minValue: -1000,
      maxHistorySize: 100
    }
  }

  /**
   * Subscribe to live data for a specific widget
   * @param {string} widgetId - Widget identifier
   * @param {string} topic - MQTT topic to subscribe to
   * @param {Object} options - Subscription options
   * @returns {Function} Unsubscribe function
   */
  subscribeToWidget(widgetId, topic, options = {}) {
    const {
      valuePath = null,
      historySize = 20,
      validation = true,
      onUpdate = null
    } = options

    console.log(`🔗 LiveDataService: Subscribing widget ${widgetId} to topic ${topic}`, {
      valuePath,
      historySize,
      validation
    })

    const handler = (data, receivedTopic) => {
      try {
        console.log(`📊 LiveDataService: Data received for widget ${widgetId} from topic ${receivedTopic}:`, data)
        
        // Validate data if enabled
        if (validation && this.dataValidation.enabled) {
          const validatedData = this.validateData(data, valuePath)
          if (validatedData === null) {
            console.warn(`⚠️ Invalid data for widget ${widgetId}:`, data)
            return
          }
          data = validatedData
        }

        // Extract value using valuePath if provided
        let extractedValue = data
        if (valuePath && typeof data === 'object') {
          extractedValue = this.extractValueByPath(data, valuePath)
        }

        // Update widget data
        this.updateWidgetData(widgetId, {
          value: extractedValue,
          rawData: data,
          timestamp: new Date().toISOString(),
          isConnected: true,
          topic: receivedTopic
        })

        // Call custom update handler
        if (onUpdate) {
          onUpdate(extractedValue, data)
        }

        // Emit global widget update event
        this.emitWidgetUpdate(widgetId, extractedValue, data)

      } catch (error) {
        console.error(`❌ Error processing data for widget ${widgetId}:`, error)
      }
    }

    // Subscribe to MQTT topic
    const success = mqttService.subscribe(topic, handler)
    
    if (success) {
      console.log(`✅ LiveDataService: Successfully subscribed widget ${widgetId} to topic ${topic}`)
      
      // Store subscription info
      if (!this.subscriptions.has(topic)) {
        this.subscriptions.set(topic, new Set())
      }
      this.subscriptions.get(topic).add({ widgetId, handler, options })
      
      // Update connection status
      this.updateConnectionStatus(true)
      
      console.log(`📈 LiveDataService: Total active subscriptions: ${this.subscriptions.size}`)
      
      return () => this.unsubscribeFromWidget(widgetId, topic)
    } else {
      console.error(`❌ LiveDataService: Failed to subscribe widget ${widgetId} to topic ${topic}`)
      console.log(`🔍 LiveDataService: MQTT connection status:`, mqttService.getConnectionStatus())
      return () => {}
    }
  }

  /**
   * Unsubscribe from widget data
   * @param {string} widgetId - Widget identifier
   * @param {string} topic - MQTT topic
   */
  unsubscribeFromWidget(widgetId, topic) {
    console.log(`🔌 Unsubscribing widget ${widgetId} from topic ${topic}`)
    
    if (this.subscriptions.has(topic)) {
      const topicSubscriptions = this.subscriptions.get(topic)
      const subscription = Array.from(topicSubscriptions).find(sub => sub.widgetId === widgetId)
      
      if (subscription) {
        mqttService.unsubscribe(topic, subscription.handler)
        topicSubscriptions.delete(subscription)
        
        if (topicSubscriptions.size === 0) {
          this.subscriptions.delete(topic)
        }
      }
    }

    // Mark widget as disconnected
    this.updateWidgetData(widgetId, {
      isConnected: false,
      lastDisconnected: new Date().toISOString()
    })
  }

  /**
   * Update widget data with validation and history
   * @param {string} widgetId - Widget identifier
   * @param {Object} data - Data to store
   */
  updateWidgetData(widgetId, data) {
    const currentData = this.widgetData.get(widgetId) || {
      history: [],
      isConnected: false,
      lastUpdated: null
    }

    const updatedData = {
      ...currentData,
      ...data,
      lastUpdated: new Date().toISOString()
    }

    // Maintain history if value is provided
    if (data.value !== undefined) {
      updatedData.history = [
        ...updatedData.history,
        { value: data.value, timestamp: data.timestamp }
      ].slice(-this.dataValidation.maxHistorySize)
    }

    this.widgetData.set(widgetId, updatedData)
  }

  /**
   * Get current data for a widget
   * @param {string} widgetId - Widget identifier
   * @returns {Object} Widget data
   */
  getWidgetData(widgetId) {
    return this.widgetData.get(widgetId) || {
      value: null,
      isConnected: false,
      history: [],
      lastUpdated: null
    }
  }

  /**
   * Validate incoming data
   * @param {*} data - Data to validate
   * @param {string} valuePath - Path to extract value
   * @returns {*} Validated data or null if invalid
   */
  validateData(data, valuePath = null) {
    if (data === null || data === undefined) return null

    let value = data
    if (valuePath) {
      value = this.extractValueByPath(data, valuePath)
    }

    // Check if value is a number within valid range
    if (typeof value === 'number') {
      if (value < this.dataValidation.minValue || value > this.dataValidation.maxValue) {
        return null
      }
      if (!isFinite(value)) {
        return null
      }
    }

    return data
  }

  /**
   * Extract value from object using dot notation path
   * @param {Object} obj - Object to extract from
   * @param {string} path - Dot notation path
   * @returns {*} Extracted value
   */
  extractValueByPath(obj, path) {
    if (!path) return obj
    
    try {
      return path.split('.').reduce((current, key) => current?.[key], obj)
    } catch (error) {
      console.warn(`⚠️ Error extracting value by path ${path}:`, error)
      return null
    }
  }

  /**
   * Emit widget update event
   * @param {string} widgetId - Widget identifier
   * @param {*} value - New value
   * @param {*} rawData - Raw data
   */
  emitWidgetUpdate(widgetId, value, rawData) {
    const event = new CustomEvent('live-data-update', {
      detail: {
        widgetId,
        value,
        rawData,
        timestamp: new Date().toISOString()
      }
    })
    window.dispatchEvent(event)
  }

  /**
   * Update connection status
   * @param {boolean} isConnected - Connection status
   */
  updateConnectionStatus(isConnected) {
    this.connectionStatus.isConnected = isConnected
    if (isConnected) {
      this.connectionStatus.lastConnected = new Date().toISOString()
      this.connectionStatus.reconnectAttempts = 0
    }
  }

  /**
   * Get connection status
   * @returns {Object} Connection status
   */
  getConnectionStatus() {
    return {
      ...this.connectionStatus,
      activeSubscriptions: this.subscriptions.size,
      activeWidgets: this.widgetData.size
    }
  }

  /**
   * Get all active widget data
   * @returns {Object} All widget data
   */
  getAllWidgetData() {
    const result = {}
    for (const [widgetId, data] of this.widgetData.entries()) {
      result[widgetId] = data
    }
    return result
  }

  /**
   * Clear all subscriptions and data
   */
  clearAll() {
    console.log('🧹 Clearing all live data subscriptions')
    
    // Unsubscribe from all topics
    for (const [topic, subscriptions] of this.subscriptions.entries()) {
      for (const subscription of subscriptions) {
        mqttService.unsubscribe(topic, subscription.handler)
      }
    }
    
    this.subscriptions.clear()
    this.widgetData.clear()
    this.connectionStatus.isConnected = false
  }

  /**
   * Set data validation rules
   * @param {Object} rules - Validation rules
   */
  setValidationRules(rules) {
    this.dataValidation = { ...this.dataValidation, ...rules }
  }

  /**
   * Get performance metrics
   * @returns {Object} Performance metrics
   */
  getPerformanceMetrics() {
    const totalWidgets = this.widgetData.size
    const connectedWidgets = Array.from(this.widgetData.values()).filter(w => w.isConnected).length
    const totalSubscriptions = Array.from(this.subscriptions.values()).reduce((sum, set) => sum + set.size, 0)
    
    return {
      totalWidgets,
      connectedWidgets,
      totalSubscriptions,
      connectionRate: totalWidgets > 0 ? (connectedWidgets / totalWidgets) * 100 : 0,
      isHealthy: connectedWidgets > 0 && this.connectionStatus.isConnected
    }
  }
}

export default new LiveDataService()
