import mqtt from 'mqtt'
import randomDataGenerator from './randomDataGenerator'

class MQTTService {
  constructor() {
    this.client = null
    this.isConnected = false
    this.subscribers = new Map()
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectInterval = 5000
    
    // MQTT Configuration
    this.config = {
      broker: 'ws://localhost:8083/mqtt', // Default MQTT broker URL
      options: {
        clientId: `iot-dashboard-${Math.random().toString(16).substr(2, 8)}`,
        clean: true,
        reconnectPeriod: 5000,
        connectTimeout: 30 * 1000,
        username: '', // Add if your broker requires authentication
        password: '', // Add if your broker requires authentication
        will: {
          topic: 'iot/dashboard/status',
          payload: 'offline',
          qos: 1,
          retain: true
        }
      }
    }
  }

  // Initialize MQTT connection
  async connect(brokerUrl = null) {
    try {
      const url = brokerUrl || this.config.broker
      
      console.log('Connecting to MQTT broker:', url)
      
      this.client = mqtt.connect(url, this.config.options)
      
      this.client.on('connect', () => {
        console.log('MQTT Connected successfully')
        this.isConnected = true
        this.reconnectAttempts = 0
        
        // Publish online status
        this.publish('iot/dashboard/status', 'online', { qos: 1, retain: true })
        
        // Start publishing random data
        this.startDataPublishing()
        
        // Notify subscribers about connection
        this.notifySubscribers('connection', { status: 'connected' })
      })
      
      this.client.on('error', (error) => {
        console.error('MQTT Connection error:', error)
        this.isConnected = false
        this.notifySubscribers('connection', { status: 'error', error })
      })
      
      this.client.on('close', () => {
        console.log('MQTT Connection closed')
        this.isConnected = false
        this.notifySubscribers('connection', { status: 'disconnected' })
      })
      
      this.client.on('reconnect', () => {
        console.log('MQTT Reconnecting...')
        this.reconnectAttempts++
        this.notifySubscribers('connection', { status: 'reconnecting' })
      })
      
      this.client.on('message', (topic, message) => {
        try {
          const data = JSON.parse(message.toString())
          this.notifySubscribers(topic, data)
        } catch (error) {
          // Handle non-JSON messages
          this.notifySubscribers(topic, { message: message.toString() })
        }
      })
      
    } catch (error) {
      console.error('Failed to connect to MQTT broker:', error)
      this.isConnected = false
      this.notifySubscribers('connection', { status: 'error', error })
    }
  }

  // Disconnect from MQTT broker
  disconnect() {
    if (this.client) {
      this.publish('iot/dashboard/status', 'offline', { qos: 1, retain: true })
      this.client.end()
      this.client = null
      this.isConnected = false
      this.notifySubscribers('connection', { status: 'disconnected' })
    }
  }

  // Subscribe to a topic
  subscribe(topic, callback) {
    if (!this.client || !this.isConnected) {
      console.warn('MQTT not connected. Cannot subscribe to:', topic)
      return false
    }

    // Store callback for this topic
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, new Set())
    }
    this.subscribers.get(topic).add(callback)

    // Subscribe to the topic
    this.client.subscribe(topic, (error) => {
      if (error) {
        console.error('Failed to subscribe to topic:', topic, error)
      } else {
        console.log('Subscribed to topic:', topic)
      }
    })

    return true
  }

  // Unsubscribe from a topic
  unsubscribe(topic, callback = null) {
    if (callback) {
      // Remove specific callback
      const callbacks = this.subscribers.get(topic)
      if (callbacks) {
        callbacks.delete(callback)
        if (callbacks.size === 0) {
          this.subscribers.delete(topic)
          if (this.client && this.isConnected) {
            this.client.unsubscribe(topic)
          }
        }
      }
    } else {
      // Remove all callbacks for this topic
      this.subscribers.delete(topic)
      if (this.client && this.isConnected) {
        this.client.unsubscribe(topic)
      }
    }
  }

  // Publish message to a topic
  publish(topic, message, options = {}) {
    if (!this.client || !this.isConnected) {
      console.warn('MQTT not connected. Cannot publish to:', topic)
      return false
    }

    const payload = typeof message === 'object' ? JSON.stringify(message) : message
    const publishOptions = {
      qos: 0,
      retain: false,
      ...options
    }

    this.client.publish(topic, payload, publishOptions, (error) => {
      if (error) {
        console.error('Failed to publish to topic:', topic, error)
      } else {
        console.log('Published to topic:', topic, payload)
      }
    })

    return true
  }

  // Notify subscribers about topic updates
  notifySubscribers(topic, data) {
    const callbacks = this.subscribers.get(topic)
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data, topic)
        } catch (error) {
          console.error('Error in MQTT callback:', error)
        }
      })
    }
  }

  // Start publishing random sensor data
  startDataPublishing() {
    if (!this.isConnected) return

    // Publish data for each device every 2-3 seconds
    const devices = randomDataGenerator.getDevices()
    
    devices.forEach(device => {
      const publishInterval = setInterval(() => {
        if (!this.isConnected) {
          clearInterval(publishInterval)
          return
        }

        const sensorData = randomDataGenerator.generateSensorData(device.id)
        const topic = `iot/sensors/${device.type}/${device.id}`
        
        console.log(`🔄 Publishing to ${topic}:`, sensorData)
        this.publish(topic, sensorData, { qos: 1 })
      }, 2000 + Math.random() * 1000) // Random interval between 2-3 seconds
    })

    // Publish alerts occasionally
    setInterval(() => {
      if (!this.isConnected) return
      
      if (Math.random() > 0.8) { // 20% chance every interval
        const alert = randomDataGenerator.generateAlert()
        this.publish('iot/alerts', alert, { qos: 1 })
      }
    }, 10000) // Check every 10 seconds

    // Publish system status
    setInterval(() => {
      if (!this.isConnected) return
      
      const systemStatus = {
        timestamp: new Date().toISOString(),
        connectedDevices: devices.length,
        activeSensors: devices.filter(d => Math.random() > 0.1).length, // 90% active
        systemLoad: Math.random() * 100,
        uptime: Date.now() - this.startTime
      }
      
      this.publish('iot/system/status', systemStatus, { qos: 1 })
    }, 30000) // Every 30 seconds
  }

  // Get connection status
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      broker: this.config.broker,
      clientId: this.config.options.clientId
    }
  }

  // Update broker configuration
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig }
  }

  // Simulate MQTT connection for development (when no real broker is available)
  simulateConnection() {
    console.log('🚀 Simulating MQTT connection for development')
    this.isConnected = true
    this.startTime = Date.now()
    
    // Notify about simulated connection
    this.notifySubscribers('connection', { status: 'connected', simulated: true })
    
    // Start simulated data publishing
    this.startDataPublishing()
    
    console.log('📡 MQTT simulation started - data will update every 2-3 seconds')
    console.log('🔍 Check browser console to see live data updates')
  }

  // Get available topics (for development)
  getAvailableTopics() {
    const devices = randomDataGenerator.getDevices()
    return [
      'iot/dashboard/status',
      'iot/system/status',
      'iot/alerts',
      ...devices.map(device => `iot/sensors/${device.type}/${device.id}`)
    ]
  }
}

// Create singleton instance
const mqttService = new MQTTService()

export default mqttService
