import { useState, useEffect, useRef } from 'react'
import autoValueService from '../services/autoValueService'

/**
 * Custom hook for professional auto-generated values
 * @param {string} widgetId - Unique widget identifier
 * @param {string} widgetType - Type of widget (gauge, chart, toggle, etc.)
 * @param {Object} config - Widget configuration
 * @param {string} panelId - Panel identifier for context
 * @param {boolean} enabled - Whether auto-generation is enabled
 * @returns {Object} { value, connected, setValue, deviceInfo }
 */
export const useAutoValue = (widgetId, widgetType, config = {}, panelId = 'default', enabled = true) => {
  const [value, setValue] = useState(null)
  const [connected, setConnected] = useState(false)
  const [deviceInfo, setDeviceInfo] = useState(null)
  const isSubscribed = useRef(false)

  useEffect(() => {
    if (!enabled || !widgetId || !widgetType) {
      setConnected(false)
      return
    }

    // Subscribe to auto-generated values
    const handleValueUpdate = (newValue, isConnected) => {
      setValue(newValue)
      setConnected(isConnected)
    }

    autoValueService.subscribe(widgetId, widgetType, config, panelId, handleValueUpdate)
    isSubscribed.current = true

    // Get device info
    const subscription = autoValueService.subscribers.get(widgetId)
    if (subscription) {
      setDeviceInfo(subscription.deviceProfile)
    }

    // Cleanup on unmount
    return () => {
      if (isSubscribed.current) {
        autoValueService.unsubscribe(widgetId)
        isSubscribed.current = false
      }
    }
  }, [widgetId, widgetType, enabled, panelId, JSON.stringify(config)])

  // Manual value setter (for user interactions)
  const updateValue = (newValue) => {
    setValue(newValue)
  }

  return {
    value,
    connected,
    setValue: updateValue,
    deviceInfo
  }
}

export default useAutoValue
