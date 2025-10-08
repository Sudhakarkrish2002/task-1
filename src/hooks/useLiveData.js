import { useEffect, useState, useCallback, useRef } from 'react'
import liveDataService from '../services/liveDataService'

/**
 * Hook for live data in shared dashboards
 * Provides real-time data streaming for IoT widgets
 * @param {string} widgetId - Widget identifier
 * @param {string} topic - MQTT topic to subscribe to
 * @param {Object} options - Configuration options
 * @returns {Object} Live data state and controls
 */
export function useLiveData(widgetId, topic, options = {}) {
  const {
    valuePath = null,
    historySize = 20,
    validation = true,
    autoConnect = true,
    onUpdate = null
  } = options

  const [data, setData] = useState({
    value: null,
    isConnected: false,
    history: [],
    lastUpdated: null,
    error: null
  })

  const unsubscribeRef = useRef(null)
  const isSubscribedRef = useRef(false)

  // Update handler for live data
  const handleUpdate = useCallback((value, rawData) => {
    setData(prev => ({
      ...prev,
      value,
      rawData,
      isConnected: true,
      lastUpdated: new Date().toISOString(),
      error: null
    }))

    if (onUpdate) {
      onUpdate(value, rawData)
    }
  }, [onUpdate])

  // Subscribe to live data
  const subscribe = useCallback(() => {
    if (!widgetId || !topic || isSubscribedRef.current) return

    console.log(`🔗 Subscribing to live data for widget ${widgetId}`)
    
    unsubscribeRef.current = liveDataService.subscribeToWidget(
      widgetId,
      topic,
      {
        valuePath,
        historySize,
        validation,
        onUpdate: handleUpdate
      }
    )

    isSubscribedRef.current = true
  }, [widgetId, topic, valuePath, historySize, validation, handleUpdate])

  // Unsubscribe from live data
  const unsubscribe = useCallback(() => {
    if (unsubscribeRef.current) {
      console.log(`🔌 Unsubscribing from live data for widget ${widgetId}`)
      unsubscribeRef.current()
      unsubscribeRef.current = null
      isSubscribedRef.current = false
    }
  }, [widgetId])

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect && widgetId && topic) {
      subscribe()
    }

    return () => {
      unsubscribe()
    }
  }, [autoConnect, widgetId, topic, subscribe, unsubscribe])

  // Update data from service
  useEffect(() => {
    const serviceData = liveDataService.getWidgetData(widgetId)
    if (serviceData) {
      setData(prev => ({
        ...prev,
        ...serviceData,
        error: null
      }))
    }
  }, [widgetId])

  // Listen for global live data updates
  useEffect(() => {
    const handleLiveDataUpdate = (event) => {
      const { widgetId: eventWidgetId, value, rawData } = event.detail
      if (eventWidgetId === widgetId) {
        setData(prev => ({
          ...prev,
          value,
          rawData,
          isConnected: true,
          lastUpdated: new Date().toISOString(),
          error: null
        }))
      }
    }

    window.addEventListener('live-data-update', handleLiveDataUpdate)
    return () => {
      window.removeEventListener('live-data-update', handleLiveDataUpdate)
    }
  }, [widgetId])

  return {
    data,
    subscribe,
    unsubscribe,
    isSubscribed: isSubscribedRef.current,
    connectionStatus: liveDataService.getConnectionStatus()
  }
}

/**
 * Hook for panel-level live data management
 * @param {string} panelId - Panel identifier
 * @param {Array} widgets - Array of widget configurations
 * @returns {Object} Panel live data state
 */
export function usePanelLiveData(panelId, widgets = []) {
  const [panelData, setPanelData] = useState({})
  const [connectionStatus, setConnectionStatus] = useState({
    isConnected: false,
    activeWidgets: 0,
    totalWidgets: widgets.length
  })

  // Create a stable reference to widgets to prevent infinite loops
  const widgetsRef = useRef([])
  const [stableWidgets, setStableWidgets] = useState([])

  // Update stable widgets only when the actual widget data changes
  useEffect(() => {
    const widgetsChanged = widgets.length !== widgetsRef.current.length || 
      widgets.some((w, i) => {
        const prev = widgetsRef.current[i]
        return !prev || w.id !== prev.id || w.topic !== prev.topic || w.valuePath !== prev.valuePath
      })

    if (widgetsChanged) {
      console.log('📋 Widget configuration changed, updating subscriptions')
      widgetsRef.current = widgets
      setStableWidgets([...widgets])
    }
  }, [widgets])

  // Subscribe to all widgets in the panel
  useEffect(() => {
    if (!panelId || stableWidgets.length === 0) {
      console.log(`⏭️ usePanelLiveData: Skipping setup`, { panelId, widgetsCount: stableWidgets.length })
      return
    }

    console.log(`🔗 usePanelLiveData: Setting up live data for panel ${panelId} with ${stableWidgets.length} widgets`)

    const subscriptions = []

    stableWidgets.forEach(widget => {
      // CRITICAL FIX: Extract MQTT topic from widget.config.mqttTopic or use panelId as fallback
      const widgetTopic = widget.config?.mqttTopic || widget.topic || panelId
      const widgetValuePath = widget.config?.valuePath || widget.valuePath
      
      if (widget.id && widgetTopic) {
        console.log(`🔗 usePanelLiveData: Subscribing widget ${widget.id} to topic ${widgetTopic}`, {
          widgetType: widget.type,
          configMqttTopic: widget.config?.mqttTopic,
          directTopic: widget.topic,
          fallbackPanelId: panelId,
          valuePath: widgetValuePath
        })
        
        const unsubscribe = liveDataService.subscribeToWidget(
          widget.id,
          widgetTopic,
          {
            valuePath: widgetValuePath,
            validation: true,
            onUpdate: (value, rawData) => {
              console.log(`✅ usePanelLiveData: Widget ${widget.id} received data update:`, { 
                value, 
                rawData,
                timestamp: new Date().toISOString()
              })
              setPanelData(prev => ({
                ...prev,
                [widget.id]: {
                  value,
                  rawData,
                  isConnected: true,
                  lastUpdated: new Date().toISOString()
                }
              }))
            }
          }
        )
        subscriptions.push(unsubscribe)
      } else {
        console.warn(`⚠️ usePanelLiveData: Widget ${widget.id} has no valid topic, skipping subscription`)
      }
    })

    console.log(`✅ usePanelLiveData: Successfully set up ${subscriptions.length} widget subscriptions`)

    return () => {
      console.log(`🔌 usePanelLiveData: Cleaning up ${subscriptions.length} subscriptions for panel ${panelId}`)
      subscriptions.forEach(unsubscribe => unsubscribe())
    }
  }, [panelId, stableWidgets])

  // Update connection status
  useEffect(() => {
    const updateStatus = () => {
      const status = liveDataService.getConnectionStatus()
      const metrics = liveDataService.getPerformanceMetrics()
      
      setConnectionStatus({
        isConnected: status.isConnected,
        activeWidgets: metrics.connectedWidgets,
        totalWidgets: metrics.totalWidgets,
        connectionRate: metrics.connectionRate,
        isHealthy: metrics.isHealthy
      })
    }

    updateStatus()
    const interval = setInterval(updateStatus, 1000)
    
    return () => clearInterval(interval)
  }, [])

  return {
    panelData,
    connectionStatus,
    getWidgetData: (widgetId) => panelData[widgetId] || null,
    isWidgetConnected: (widgetId) => panelData[widgetId]?.isConnected || false
  }
}

/**
 * Hook for live data statistics and monitoring
 * @returns {Object} Live data statistics
 */
export function useLiveDataStats() {
  const [stats, setStats] = useState({
    totalWidgets: 0,
    connectedWidgets: 0,
    connectionRate: 0,
    isHealthy: false,
    activeSubscriptions: 0
  })

  useEffect(() => {
    const updateStats = () => {
      const metrics = liveDataService.getPerformanceMetrics()
      const connectionStatus = liveDataService.getConnectionStatus()
      
      setStats({
        totalWidgets: metrics.totalWidgets,
        connectedWidgets: metrics.connectedWidgets,
        connectionRate: metrics.connectionRate,
        isHealthy: metrics.isHealthy,
        activeSubscriptions: connectionStatus.activeSubscriptions
      })
    }

    updateStats()
    const interval = setInterval(updateStats, 2000)
    
    return () => clearInterval(interval)
  }, [])

  return stats
}

export default useLiveData
