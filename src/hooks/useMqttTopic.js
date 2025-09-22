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

export function useMqttTopic(topic, options = {}) {
  const { valuePath, historySize = 20, enabled = true } = options
  const [connected, setConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState(null)
  const [numericValue, setNumericValue] = useState(null)
  const historyRef = useRef([])

  const safeTopic = useMemo(() => (typeof topic === 'string' && topic.trim().length > 0 ? topic.trim() : null), [topic])

  useEffect(() => {
    setConnected(mqttService.getConnectionStatus().isConnected === true)
  }, [])

  useEffect(() => {
    if (!enabled || !safeTopic) return

    const handler = (data) => {
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

    const ok = mqttService.subscribe(safeTopic, handler)
    if (!ok) {
      // If not connected yet, try once to connect and then subscribe
      mqttService.connect().catch(() => {})
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


