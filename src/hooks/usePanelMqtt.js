import { useEffect, useRef, useCallback } from 'react'
import { usePanelStore } from '../stores/usePanelStore'
import mqttService from '../services/mqttService'

/**
 * Hook to manage MQTT subscriptions for panels
 * Implements the real-time data flow: Panel ID as topic, widget data updates
 */
export const usePanelMqtt = (panelId) => {
  const { currentPanel, updateWidget } = usePanelStore()
  const subscriptionRef = useRef(null)
  const isSubscribedRef = useRef(false)

  // Handle incoming MQTT data for widgets
  const handleMqttData = useCallback((data, topic) => {
    console.log(`📊 Panel ${panelId} received MQTT data:`, data)
    
    // Process widget data updates
    if (typeof data === 'object' && data !== null) {
      Object.keys(data).forEach(widgetId => {
        const widgetData = data[widgetId]
        console.log(`🎯 Updating widget ${widgetId} with data:`, widgetData)
        
        // Update widget in the panel store
        updateWidget(panelId, widgetId, {
          data: widgetData,
          lastUpdated: new Date().toISOString(),
          isConnected: true
        })
      })
    }
  }, [panelId, updateWidget])

  // Subscribe to panel MQTT topic when panel is active
  const subscribeToPanel = useCallback(async () => {
    if (!panelId || isSubscribedRef.current) {
      console.log(`⏭️ Skipping subscription - panelId: ${panelId}, already subscribed: ${isSubscribedRef.current}`)
      return
    }

    try {
      console.log(`🔄 Starting subscription process for panel: ${panelId}`)
      
      // Ensure MQTT connection
      if (!mqttService.isConnected) {
        console.log('🔌 MQTT not connected, attempting to connect...')
        await mqttService.connect()
        console.log('✅ MQTT connection established')
      } else {
        console.log('✅ MQTT already connected')
      }

      // Subscribe to panel topic (panel ID as topic)
      console.log(`📡 Subscribing to panel topic: ${panelId}`)
      const success = mqttService.subscribeToPanel(panelId, handleMqttData)
      
      if (success) {
        isSubscribedRef.current = true
        subscriptionRef.current = panelId
        console.log(`✅ Successfully subscribed to panel ${panelId} MQTT topic`)
        console.log('🔍 Current MQTT status:', mqttService.getConnectionStatus())
      } else {
        console.error(`❌ Failed to subscribe to panel ${panelId}`)
        console.log('🔍 MQTT connection status:', mqttService.getConnectionStatus())
      }
    } catch (error) {
      console.error(`❌ Error subscribing to panel ${panelId}:`, error)
      console.log('🔍 MQTT connection status:', mqttService.getConnectionStatus())
    }
  }, [panelId, handleMqttData])

  // Unsubscribe from panel MQTT topic
  const unsubscribeFromPanel = useCallback(() => {
    if (!panelId || !isSubscribedRef.current) {
      return
    }

    try {
      mqttService.unsubscribeFromPanel(panelId, handleMqttData)
      isSubscribedRef.current = false
      subscriptionRef.current = null
      console.log(`📡 Unsubscribed from panel ${panelId} MQTT topic`)
    } catch (error) {
      console.error(`❌ Error unsubscribing from panel ${panelId}:`, error)
    }
  }, [panelId, handleMqttData])

  // Publish data to panel (for widget control)
  const publishToPanel = useCallback((widgetId, data) => {
    if (!panelId || !widgetId) {
      console.error('❌ Panel ID and Widget ID are required for publishing')
      return false
    }

    return mqttService.publishToPanel(panelId, widgetId, data)
  }, [panelId])

  // Auto-subscribe when panel changes
  useEffect(() => {
    if (panelId && currentPanel?.id === panelId) {
      subscribeToPanel()
    } else {
      unsubscribeFromPanel()
    }

    // Cleanup on unmount
    return () => {
      unsubscribeFromPanel()
    }
  }, [panelId, currentPanel?.id, subscribeToPanel, unsubscribeFromPanel])

  // Listen for MQTT widget update events
  useEffect(() => {
    const handleWidgetUpdate = (event) => {
      const { panelId: eventPanelId, widgetId, data } = event.detail
      
      if (eventPanelId === panelId) {
        console.log(`🎯 Widget update event for panel ${panelId}, widget ${widgetId}:`, data)
        
        // Update widget data
        updateWidget(panelId, widgetId, {
          data: data,
          lastUpdated: new Date().toISOString(),
          isConnected: true
        })
      }
    }

    window.addEventListener('mqtt-widget-update', handleWidgetUpdate)
    
    return () => {
      window.removeEventListener('mqtt-widget-update', handleWidgetUpdate)
    }
  }, [panelId, updateWidget])

  return {
    isSubscribed: isSubscribedRef.current,
    subscribeToPanel,
    unsubscribeFromPanel,
    publishToPanel,
    connectionStatus: mqttService.getConnectionStatus()
  }
}

export default usePanelMqtt
