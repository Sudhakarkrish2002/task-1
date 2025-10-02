import mqtt from 'mqtt'
import widgetDataService from './widgetDataService'

class MQTTService {
  constructor() {
    this.client = null
    this.isConnected = false
    this.subscriptions = new Map()
    this.messageHandlers = new Map()
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 3
    this.reconnectInterval = 10000
    this.connectionTimeout = null
    this.isConnecting = false
    this.connectionAttempted = false
  }

  // Connect to MQTT broker
  async connect(options = {}) {
    // Prevent multiple connection attempts
    if (this.isConnecting) {
      console.log('🔄 MQTT connection already in progress...')
      return Promise.reject(new Error('Connection already in progress'))
    }

    if (this.isConnected) {
      console.log('✅ MQTT already connected')
      return Promise.resolve(this.client)
    }

    // If we've already attempted connection and failed, don't try again
    if (this.connectionAttempted && !this.isConnected) {
      console.log('⚠️ MQTT connection already attempted and failed, skipping...')
      return Promise.reject(new Error('Connection already attempted and failed'))
    }

    this.isConnecting = true
    this.connectionAttempted = true

    const defaultOptions = {
      host: '71123c109076412ebb47f6ede49445f3.s1.eu.hivemq.cloud',
      port: 8884, // Use 8080 for WebSocket connection
      protocol: 'wss',
      username: 'hivemq.webclient.1759407250715',
      password: 'p6H&Z>8EwbDCy7aP.,1r',
      clientId: `iot-dashboard-${Math.random().toString(16).substr(2, 8)}`,
      clean: true,
      reconnectPeriod: 1000, // Disable auto-reconnect, we'll handle it manually
      connectTimeout: 5000, // Reduced timeout
      ...options
    }

    try {
      console.log('🔎 Vite MQTT env:', {
        VITE_MQTT_PROTOCOL: import.meta?.env?.VITE_MQTT_PROTOCOL,
        VITE_MQTT_HOST: import.meta?.env?.VITE_MQTT_HOST,
        VITE_MQTT_PORT: import.meta?.env?.VITE_MQTT_PORT,
        VITE_MQTT_USERNAME: import.meta?.env?.VITE_MQTT_USERNAME ? 'set' : undefined
      })
      
      const brokerUrl = `${defaultOptions.protocol}://${defaultOptions.host}:${defaultOptions.port}/mqtt`;
      console.log('🔧 MQTT broker URL:', brokerUrl)
      
      this.client = mqtt.connect(brokerUrl, {
        clientId: defaultOptions.clientId,
        username: defaultOptions.username,
        password: defaultOptions.password,
        clean: defaultOptions.clean,
        reconnectPeriod: defaultOptions.reconnectPeriod,
        connectTimeout: defaultOptions.connectTimeout,
      })

      this.setupEventHandlers()
      
      return new Promise((resolve, reject) => {
        // Clear any existing timeout
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout)
        }

        this.client.on('connect', () => {
          console.log('✅ MQTT Connected successfully')
          this.isConnected = true
          this.isConnecting = false
          this.reconnectAttempts = 0
          if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout)
          }
          resolve(this.client)
        })

        this.client.on('error', (error) => {
          console.error('❌ MQTT Connection error:', error)
          this.isConnecting = false
          if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout)
          }
          reject(error)
        })

        // Timeout after 5 seconds
        this.connectionTimeout = setTimeout(() => {
          if (!this.isConnected) {
            this.isConnecting = false
            this.client?.end()
            reject(new Error('MQTT connection timeout'))
          }
        }, 5000)
      })
    } catch (error) {
      this.isConnecting = false
      console.error('❌ Failed to connect to MQTT broker:', error)
      throw error
    }
  }

  // Setup event handlers
  setupEventHandlers() {
    this.client.on('message', (topic, message) => {
      try {
        const data = JSON.parse(message.toString())
        this.handleMessage(topic, data)
      } catch (error) {
        // If JSON parsing fails, treat as plain text
        this.handleMessage(topic, { value: message.toString() })
      }
    })

    this.client.on('disconnect', () => {
      console.log('⚠️ MQTT Disconnected')
      this.isConnected = false
      this.isConnecting = false
    })

    this.client.on('reconnect', () => {
      console.log('🔄 MQTT Reconnecting...')
      this.reconnectAttempts++
      
      // Stop reconnecting after max attempts
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.log('❌ Max reconnection attempts reached, stopping...')
        this.client.end()
        this.isConnected = false
        this.isConnecting = false
      }
    })

    this.client.on('offline', () => {
      console.log('📴 MQTT Offline')
      this.isConnected = false
      this.isConnecting = false
    })

    this.client.on('close', () => {
      console.log('🔌 MQTT Connection closed - attempting to reconnect...')
      this.isConnected = false
      this.isConnecting = false
      
      // Attempt to reconnect after a delay
      setTimeout(() => {
        if (!this.isConnected && !this.isConnecting) {
          console.log('🔄 Attempting to reconnect MQTT...')
          this.connect().catch(error => {
            console.log('❌ Reconnection failed:', error.message)
          })
        }
      }, 3000)
    })
  }

  // Handle incoming messages
  handleMessage(topic, data) {
    console.log('📨 Received MQTT message:', { topic, data })
    
    // Parse panel-specific data format: {template_id: {widget_id: data, widget_id: data}}
    if (typeof data === 'object' && data !== null) {
      // Check if this is panel data format
      const panelId = topic // Topic is the panel ID
      const panelData = data
      
      // Process panel data through widget data service
      widgetDataService.processPanelData(panelId, panelData)
      
      // Process each widget data in the panel
      Object.keys(panelData).forEach(widgetId => {
        const widgetData = panelData[widgetId]
        console.log(`🎯 Processing widget ${widgetId} in panel ${panelId}:`, widgetData)
        
        // Trigger widget update event
        this.triggerWidgetUpdate(panelId, widgetId, widgetData)
      })
    }

    // Call specific topic handlers
    if (this.messageHandlers.has(topic)) {
      const handlers = this.messageHandlers.get(topic)
      handlers.forEach(handler => {
        try {
          handler(data, topic)
        } catch (error) {
          console.error('Error in message handler:', error)
        }
      })
    }

    // Call wildcard handlers
    this.messageHandlers.forEach((handlers, pattern) => {
      if (this.matchTopic(topic, pattern)) {
        handlers.forEach(handler => {
          try {
            handler(data, topic)
          } catch (error) {
            console.error('Error in wildcard handler:', error)
          }
        })
      }
    })
  }

  // Trigger widget update event
  triggerWidgetUpdate(panelId, widgetId, data) {
    // Dispatch custom event for widget updates
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('mqtt-widget-update', {
        detail: {
          panelId,
          widgetId,
          data,
          timestamp: new Date().toISOString()
        }
      })
      window.dispatchEvent(event)
    }
  }

  // Subscribe to a topic
  subscribe(topic, handler) {
    if (!this.isConnected) {
      console.warn('⚠️ MQTT not connected, cannot subscribe to:', topic)
      console.log('🔧 Current connection status:', this.getConnectionStatus())
      return false
    }

    try {
      this.client.subscribe(topic, (error) => {
        if (error) {
          console.error('❌ Failed to subscribe to topic:', topic, error)
          return false
        }
        console.log('📡 Successfully subscribed to topic:', topic)
        console.log('🔍 Active subscriptions:', Array.from(this.subscriptions.keys()))
      })

      // Store handler
      if (!this.messageHandlers.has(topic)) {
        this.messageHandlers.set(topic, new Set())
      }
      this.messageHandlers.get(topic).add(handler)

      // Track subscription
      this.subscriptions.set(topic, handler)

      console.log(`✅ Subscription setup complete for topic: ${topic}`)
      return true
    } catch (error) {
      console.error('❌ Error subscribing to topic:', topic, error)
      return false
    }
  }

  // Unsubscribe from a topic
  unsubscribe(topic, handler = null) {
    if (!this.isConnected) {
      console.warn('⚠️ MQTT not connected, cannot unsubscribe from:', topic)
      return false
    }

    try {
      if (handler) {
        // Remove specific handler
        if (this.messageHandlers.has(topic)) {
          this.messageHandlers.get(topic).delete(handler)
          if (this.messageHandlers.get(topic).size === 0) {
            this.messageHandlers.delete(topic)
            this.client.unsubscribe(topic)
            this.subscriptions.delete(topic)
            console.log('📡 Unsubscribed from topic:', topic)
          }
        }
      } else {
        // Remove all handlers for topic
        this.client.unsubscribe(topic)
        this.messageHandlers.delete(topic)
        this.subscriptions.delete(topic)
        console.log('📡 Unsubscribed from topic:', topic)
      }

      return true
    } catch (error) {
      console.error('❌ Error unsubscribing from topic:', topic, error)
      return false
    }
  }

  // Publish message to topic
  publish(topic, message, options = {}) {
    if (!this.isConnected) {
      console.warn('⚠️ MQTT not connected, cannot publish to:', topic)
      return false
    }

    try {
      const payload = typeof message === 'object' ? JSON.stringify(message) : message
      
      this.client.publish(topic, payload, {
        qos: options.qos || 0,
        retain: options.retain || false,
        ...options
      })

      console.log('📤 Published to topic:', topic, message)
      return true
    } catch (error) {
      console.error('❌ Error publishing to topic:', topic, error)
      return false
    }
  }

  // Check if topic matches pattern (supports wildcards)
  matchTopic(topic, pattern) {
    if (topic === pattern) return true
    
    const topicParts = topic.split('/')
    const patternParts = pattern.split('/')
    
    if (patternParts.length !== topicParts.length) return false
    
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i] === '+') continue
      if (patternParts[i] === '#') return true
      if (patternParts[i] !== topicParts[i]) return false
    }
    
    return true
  }

  // Disconnect from MQTT broker
  disconnect() {
    if (this.client) {
      this.client.end()
      this.client = null
    }
    
    
    this.isConnected = false
    this.isConnecting = false
    this.reconnectAttempts = 0
    this.connectionAttempted = false // Reset connection attempt flag
    this.subscriptions.clear()
    this.messageHandlers.clear()
    
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout)
      this.connectionTimeout = null
    }
    
    console.log('🔌 MQTT Disconnected')
  }

  // Subscribe to panel-specific topic (panel ID as topic)
  subscribeToPanel(panelId, handler = null) {
    if (!panelId) {
      console.error('❌ Panel ID is required for subscription')
      return false
    }

    console.log(`📡 Subscribing to panel: ${panelId}`)
    
    // Use panel ID as the topic
    const topic = panelId
    
    // Default handler for panel data
    const defaultHandler = (data, topic) => {
      console.log(`📊 Panel ${panelId} received data:`, data)
    }
    
    return this.subscribe(topic, handler || defaultHandler)
  }

  // Unsubscribe from panel-specific topic
  unsubscribeFromPanel(panelId, handler = null) {
    if (!panelId) {
      console.error('❌ Panel ID is required for unsubscription')
      return false
    }

    console.log(`📡 Unsubscribing from panel: ${panelId}`)
    
    // Use panel ID as the topic
    const topic = panelId
    
    return this.unsubscribe(topic, handler)
  }

  // Publish data to panel-specific topic
  publishToPanel(panelId, widgetId, data) {
    if (!panelId || !widgetId) {
      console.error('❌ Panel ID and Widget ID are required for publishing')
      return false
    }

    // Format data according to specification: {template_id: {widget_id: data}}
    const payload = {
      [widgetId]: data
    }

    console.log(`📤 Publishing to panel ${panelId}, widget ${widgetId}:`, payload)
    
    // Use panel ID as the topic
    const topic = panelId
    
    return this.publish(topic, payload)
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      connectionAttempted: this.connectionAttempted,
      isSimulationMode: false,
      clientId: this.client?.options?.clientId,
      subscriptions: Array.from(this.subscriptions.keys())
    }
  }


  // Reset connection attempt flag (useful for retrying after user action)
  resetConnectionAttempt() {
    this.connectionAttempted = false
    console.log('🔄 MQTT connection attempt flag reset')
  }

}

// Create singleton instance
const mqttService = new MQTTService()

// Make it available globally for widgets
if (typeof window !== 'undefined') {
  window.mqttService = mqttService
}

export default mqttService
