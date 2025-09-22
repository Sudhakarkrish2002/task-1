import { useState, useEffect, useRef } from 'react'
import autoValueService from '../services/autoValueService'

/**
 * Custom hook for professional auto-generated values
 * NOTE: This is ONLY used by chart widgets for demo purposes
 * All other widgets should use real-time data connections
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
    console.log('🔍 useAutoValue: Effect triggered', { widgetId, widgetType, enabled, panelId })
    
    if (!enabled || !widgetId || !widgetType) {
      console.log('🔍 useAutoValue: Not subscribing - enabled:', enabled, 'widgetId:', widgetId, 'widgetType:', widgetType)
      setConnected(false)
      return
    }

    // Subscribe to auto-generated values
    const handleValueUpdate = (newValue, isConnected) => {
      console.log('🔍 useAutoValue: Value update received', { widgetId, newValue, isConnected })
      setValue(newValue)
      setConnected(isConnected)
    }

    console.log('🔍 useAutoValue: Subscribing to autoValueService')
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
        console.log('🔍 useAutoValue: Unsubscribing', widgetId)
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
