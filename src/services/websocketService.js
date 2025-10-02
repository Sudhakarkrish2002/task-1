/**
 * WebSocket Service for Real-Time IoT Data
 * Connects to backend WebSocket server to receive MQTT data
 * Flow: Device → MQTT Broker → Backend → WebSocket → Frontend
 */

class WebSocketService {
  constructor() {
    this.ws = null
    this.isConnected = false
    this.isConnecting = false
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectInterval = 5000
    this.subscriptions = new Set()
    this.messageHandlers = new Map()
    this.connectionTimeout = null
    this.heartbeatInterval = null
    this.heartbeatTimeout = null
  }

  // Connect to WebSocket server
  async connect(options = {}) {
    if (this.isConnecting || this.isConnected) {
      return Promise.resolve(this.ws)
    }

    this.isConnecting = true

    const defaultOptions = {
      host: (import.meta?.env?.VITE_WS_HOST) || 'localhost',
      port: Number(import.meta?.env?.VITE_WS_PORT) || 5000,
      protocol: (import.meta?.env?.VITE_WS_PROTOCOL) || 'ws',
      path: '/ws',
      ...options
    }

    const wsUrl = `${defaultOptions.protocol}://${defaultOptions.host}:${defaultOptions.port}${defaultOptions.path}`
    
    console.log('🔌 Connecting to WebSocket server:', wsUrl)

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(wsUrl)

        // Connection timeout
        this.connectionTimeout = setTimeout(() => {
          if (!this.isConnected) {
            this.isConnecting = false
            this.ws?.close()
            reject(new Error('WebSocket connection timeout'))
          }
        }, 10000)

        this.ws.onopen = () => {
          console.log('✅ WebSocket connected successfully')
          this.isConnected = true
          this.isConnecting = false
          this.reconnectAttempts = 0
          
          if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout)
            this.connectionTimeout = null
          }

          // Start heartbeat
          this.startHeartbeat()

          // Resubscribe to topics
          this.subscriptions.forEach(topic => {
            this.subscribe(topic)
          })

          resolve(this.ws)
        }

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data)
            this.handleMessage(message)
          } catch (error) {
            console.error('❌ Error parsing WebSocket message:', error)
          }
        }

        this.ws.onclose = (event) => {
          console.log('🔌 WebSocket connection closed:', event.code, event.reason)
          this.isConnected = false
          this.isConnecting = false
          this.stopHeartbeat()
          
          if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout)
            this.connectionTimeout = null
          }

          // Attempt reconnection if not a clean close
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.attemptReconnect()
          }
        }

        this.ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error)
          this.isConnecting = false
          reject(error)
        }

      } catch (error) {
        this.isConnecting = false
        console.error('❌ Failed to create WebSocket connection:', error)
        reject(error)
      }
    })
  }

  // Handle incoming messages
  handleMessage(message) {
    console.log('📨 Received WebSocket message:', message)

    if (message.type === 'mqtt' && message.topic) {
      // Forward MQTT message to handlers
      const handlers = this.messageHandlers.get(message.topic) || []
      handlers.forEach(handler => {
        try {
          handler(message.data, message.topic)
        } catch (error) {
          console.error('Error in message handler:', error)
        }
      })

      // Also trigger global widget update event
      this.triggerWidgetUpdate(message.topic, message.data)
    } else if (message.type === 'pong') {
      // Heartbeat response
      this.handleHeartbeatResponse()
    }
  }

  // Trigger widget update event
  triggerWidgetUpdate(topic, data) {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('mqtt-widget-update', {
        detail: {
          topic,
          data,
          timestamp: new Date().toISOString()
        }
      })
      window.dispatchEvent(event)
    }
  }

  // Subscribe to a topic
  subscribe(topic, handler = null) {
    if (!topic) {
      console.error('❌ Topic is required for subscription')
      return false
    }

    console.log('📡 Subscribing to topic:', topic)
    
    // Store subscription
    this.subscriptions.add(topic)
    
    // Store handler
    if (handler) {
      if (!this.messageHandlers.has(topic)) {
        this.messageHandlers.set(topic, new Set())
      }
      this.messageHandlers.get(topic).add(handler)
    }

    // Send subscription message to server
    if (this.isConnected && this.ws) {
      this.sendMessage({
        action: 'subscribe',
        topic: topic
      })
    }

    return true
  }

  // Unsubscribe from a topic
  unsubscribe(topic, handler = null) {
    if (!topic) {
      console.error('❌ Topic is required for unsubscription')
      return false
    }

    console.log('📡 Unsubscribing from topic:', topic)
    
    // Remove subscription
    this.subscriptions.delete(topic)
    
    // Remove handler
    if (handler && this.messageHandlers.has(topic)) {
      this.messageHandlers.get(topic).delete(handler)
      if (this.messageHandlers.get(topic).size === 0) {
        this.messageHandlers.delete(topic)
      }
    } else {
      // Remove all handlers for topic
      this.messageHandlers.delete(topic)
    }

    // Send unsubscription message to server
    if (this.isConnected && this.ws) {
      this.sendMessage({
        action: 'unsubscribe',
        topic: topic
      })
    }

    return true
  }

  // Send message to WebSocket server
  sendMessage(message) {
    if (this.isConnected && this.ws) {
      try {
        this.ws.send(JSON.stringify(message))
        return true
      } catch (error) {
        console.error('❌ Error sending WebSocket message:', error)
        return false
      }
    }
    return false
  }

  // Start heartbeat to keep connection alive
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected && this.ws) {
        this.sendMessage({ type: 'ping' })
        
        // Set timeout for pong response
        this.heartbeatTimeout = setTimeout(() => {
          console.log('⚠️ WebSocket heartbeat timeout, reconnecting...')
          this.disconnect()
          this.attemptReconnect()
        }, 5000)
      }
    }, 30000) // Send ping every 30 seconds
  }

  // Stop heartbeat
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout)
      this.heartbeatTimeout = null
    }
  }

  // Handle heartbeat response
  handleHeartbeatResponse() {
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout)
      this.heartbeatTimeout = null
    }
  }

  // Attempt reconnection
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('❌ Max reconnection attempts reached')
      return
    }

    this.reconnectAttempts++
    console.log(`🔄 Attempting WebSocket reconnection (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)

    setTimeout(() => {
      this.connect().catch((error) => {
        console.error('❌ Reconnection failed:', error)
      })
    }, this.reconnectInterval)
  }

  // Disconnect from WebSocket server
  disconnect() {
    this.stopHeartbeat()
    
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout)
      this.connectionTimeout = null
    }

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect')
      this.ws = null
    }

    this.isConnected = false
    this.isConnecting = false
    this.subscriptions.clear()
    this.messageHandlers.clear()
    
    console.log('🔌 WebSocket disconnected')
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      reconnectAttempts: this.reconnectAttempts,
      subscriptions: Array.from(this.subscriptions),
      subscriptionsCount: this.subscriptions.size
    }
  }

  // Subscribe to panel-specific topic
  subscribeToPanel(panelId, handler = null) {
    return this.subscribe(panelId, handler)
  }

  // Unsubscribe from panel-specific topic
  unsubscribeFromPanel(panelId, handler = null) {
    return this.unsubscribe(panelId, handler)
  }
}

// Create singleton instance
const websocketService = new WebSocketService()

// Make it available globally
if (typeof window !== 'undefined') {
  window.websocketService = websocketService
}

export default websocketService
