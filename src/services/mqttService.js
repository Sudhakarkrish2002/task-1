import mqtt from 'mqtt'

class MQTTService {
  constructor() {
    this.client = null
    this.isConnected = false
    this.subscriptions = new Map()
    this.messageHandlers = new Map()
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectInterval = 5000
  }

  // Connect to MQTT broker
  async connect(options = {}) {
    const defaultOptions = {
      host: process.env.VITE_MQTT_HOST || 'localhost',
      port: process.env.VITE_MQTT_PORT || 1883,
      protocol: process.env.VITE_MQTT_PROTOCOL || 'ws',
      username: process.env.VITE_MQTT_USERNAME || '',
      password: process.env.VITE_MQTT_PASSWORD || '',
      clientId: `iot-dashboard-${Math.random().toString(16).substr(2, 8)}`,
      clean: true,
      reconnectPeriod: 5000,
      connectTimeout: 30 * 1000,
      ...options
    }

    try {
      const brokerUrl = `${defaultOptions.protocol}://${defaultOptions.host}:${defaultOptions.port}`
      
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
        this.client.on('connect', () => {
          console.log('✅ MQTT Connected successfully')
          this.isConnected = true
          this.reconnectAttempts = 0
          resolve(this.client)
        })

        this.client.on('error', (error) => {
          console.error('❌ MQTT Connection error:', error)
          reject(error)
        })

        // Timeout after 10 seconds
        setTimeout(() => {
          if (!this.isConnected) {
            reject(new Error('MQTT connection timeout'))
          }
        }, 10000)
      })
    } catch (error) {
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
    })

    this.client.on('reconnect', () => {
      console.log('🔄 MQTT Reconnecting...')
      this.reconnectAttempts++
    })

    this.client.on('offline', () => {
      console.log('📴 MQTT Offline')
      this.isConnected = false
    })
  }

  // Handle incoming messages
  handleMessage(topic, data) {
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

  // Subscribe to a topic
  subscribe(topic, handler) {
    if (!this.isConnected) {
      console.warn('⚠️ MQTT not connected, cannot subscribe to:', topic)
      return false
    }

    try {
      this.client.subscribe(topic, (error) => {
        if (error) {
          console.error('❌ Failed to subscribe to topic:', topic, error)
          return false
        }
        console.log('📡 Subscribed to topic:', topic)
      })

      // Store handler
      if (!this.messageHandlers.has(topic)) {
        this.messageHandlers.set(topic, new Set())
      }
      this.messageHandlers.get(topic).add(handler)

      // Track subscription
      this.subscriptions.set(topic, handler)

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
      this.isConnected = false
      this.subscriptions.clear()
      this.messageHandlers.clear()
      console.log('🔌 MQTT Disconnected')
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      clientId: this.client?.options?.clientId,
      subscriptions: Array.from(this.subscriptions.keys())
    }
  }

  // Simulate connection for demo purposes
  simulateConnection() {
    console.log('🎭 Simulating MQTT connection for demo')
    this.isConnected = true
    
    // Simulate some data
    setInterval(() => {
      if (this.isConnected) {
        // Simulate sensor data
        const topics = [
          'sensors/temperature',
          'sensors/humidity',
          'sensors/pressure',
          'devices/status'
        ]
        
        topics.forEach(topic => {
          if (this.messageHandlers.has(topic)) {
            const data = {
              value: Math.random() * 100,
              timestamp: new Date().toISOString(),
              unit: topic.includes('temperature') ? '°C' : 
                    topic.includes('humidity') ? '%' : 
                    topic.includes('pressure') ? 'hPa' : ''
            }
            this.handleMessage(topic, data)
          }
        })
      }
    }, 3000)
  }
}

// Create singleton instance
const mqttService = new MQTTService()

// Make it available globally for widgets
if (typeof window !== 'undefined') {
  window.mqttService = mqttService
}

export default mqttService
