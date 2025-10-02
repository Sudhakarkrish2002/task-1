import { useEffect, useMemo, useRef, useState } from 'react'
import mqttService from '../services/mqttService'

// Extract a numeric value from payload by optional valuePath (dot.notation)
function extractValueFromPayload(payload, valuePath) {
  if (payload == null) return null
  if (!valuePath) {
    if (typeof payload === 'number') return payload
    if (typeof payload === 'string') {
      const n = Number(payload)
      return Number.isFinite(n) ? n : null
    }
    if (typeof payload === 'object' && payload.value != null) {
      const maybe = payload.value
      const n = Number(maybe)
      return Number.isFinite(n) ? n : null
    }
    return null
  }

  try {
    const parts = valuePath.split('.')
    let current = payload
    for (const part of parts) {
      if (current == null) return null
      current = current[part]
    }
    const n = Number(current)
    return Number.isFinite(n) ? n : null
  } catch (_) {
    return null
  }
}

/**
 * Hook for real-time data via WebSocket
 * Flow: Device → MQTT Broker → Backend → WebSocket → Frontend
 * @param {string} topic - MQTT topic to subscribe to
 * @param {Object} options - Configuration options
 * @returns {Object} { connected, lastMessage, value, history }
 */
export function useRealtimeData(topic, options = {}) {
  const { valuePath, historySize = 20, enabled = true } = options
  const [connected, setConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState(null)
  const [numericValue, setNumericValue] = useState(null)
  const historyRef = useRef([])

  const safeTopic = useMemo(() => (typeof topic === 'string' && topic.trim().length > 0 ? topic.trim() : null), [topic])

  // Update connection status
  useEffect(() => {
    const updateConnectionStatus = () => {
      const status = mqttService.getConnectionStatus()
      setConnected(status.isConnected)
    }

    updateConnectionStatus()
    
    // Check connection status periodically
    const interval = setInterval(updateConnectionStatus, 1000)
    
    return () => clearInterval(interval)
  }, [])

  // Subscribe to topic
  useEffect(() => {
    if (!enabled || !safeTopic) return

    const handler = (data, topic) => {
      console.log(`📊 Real-time data received for ${topic}:`, data)
      setLastMessage(data)
      
      const value = extractValueFromPayload(data, valuePath)
      if (value != null) {
        setNumericValue(value)
        // Maintain rolling history
        historyRef.current = [...historyRef.current, value].slice(-historySize)
      }
      
      // Update connection flag optimistically on message
      setConnected(true)
    }

    // Subscribe to the topic
    const success = mqttService.subscribe(safeTopic, handler)
    
    if (!success) {
      console.warn(`⚠️ Failed to subscribe to topic: ${safeTopic}`)
    }

    return () => {
      mqttService.unsubscribe(safeTopic, handler)
    }
  }, [enabled, safeTopic, valuePath, historySize])

  return {
    connected,
    lastMessage,
    value: numericValue,
    history: historyRef.current,
  }
}

/**
 * Hook for panel-specific real-time data
 * @param {string} panelId - Panel ID to subscribe to
 * @param {Object} options - Configuration options
 * @returns {Object} { connected, lastMessage, panelData }
 */
export function usePanelRealtimeData(panelId, options = {}) {
  const { enabled = true } = options
  const [connected, setConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState(null)
  const [panelData, setPanelData] = useState({})

  const safePanelId = useMemo(() => (typeof panelId === 'string' && panelId.trim().length > 0 ? panelId.trim() : null), [panelId])

  // Update connection status
  useEffect(() => {
    const updateConnectionStatus = () => {
      const status = mqttService.getConnectionStatus()
      setConnected(status.isConnected)
    }

    updateConnectionStatus()
    
    // Check connection status periodically
    const interval = setInterval(updateConnectionStatus, 1000)
    
    return () => clearInterval(interval)
  }, [])

  // Subscribe to panel topic
  useEffect(() => {
    if (!enabled || !safePanelId) return

    const handler = (data, topic) => {
      console.log(`📊 Panel data received for ${topic}:`, data)
      setLastMessage(data)
      
      // Update panel data
      if (typeof data === 'object' && data !== null) {
        setPanelData(prevData => ({
          ...prevData,
          ...data,
          lastUpdated: new Date().toISOString()
        }))
      }
      
      // Update connection flag optimistically on message
      setConnected(true)
    }

    // Subscribe to the panel topic
    const success = mqttService.subscribeToPanel(safePanelId, handler)
    
    if (!success) {
      console.warn(`⚠️ Failed to subscribe to panel: ${safePanelId}`)
    }

    return () => {
      mqttService.unsubscribeFromPanel(safePanelId, handler)
    }
  }, [enabled, safePanelId])

  return {
    connected,
    lastMessage,
    panelData,
  }
}

export default useRealtimeData
