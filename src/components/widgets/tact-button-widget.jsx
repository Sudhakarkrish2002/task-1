import React, { useEffect, useMemo, useState } from 'react'
import { useRealtimeData } from '../../hooks/useRealtimeData'
import mqttService from '../../services/mqttService'

export const TactButtonWidget = ({ 
  widgetId,
  title = 'Button',
  panelId = 'default',
  isPressed = false,
  connected = false,
  deviceInfo = null,
  buttonLabel = 'PRESS',
  buttonColor = '#3b82f6', // Default blue
  setIsPressed = () => {},
  // Optional MQTT wiring
  stateTopic,
  commandTopic,
  pressPayload = 'PRESSED',
  releasePayload = 'RELEASED',
  valuePath
}) => {
  // Mobile detection for responsive layout
  const [isMobile, setIsMobile] = useState(false)
  const [pressCount, setPressCount] = useState(0)
  const [isLocalPressed, setIsLocalPressed] = useState(false)
  
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  // Subscribe to state topic (reflect external changes)
  const { value: liveValue, connected: realtimeConnected, lastMessage } = useRealtimeData(stateTopic, { valuePath })
  const effectiveConnected = connected || realtimeConnected
  
  // Determine button state from live value
  const effectiveIsPressed = useMemo(() => {
    if (liveValue != null) {
      if (typeof liveValue === 'boolean') return liveValue
      if (typeof liveValue === 'number') return liveValue !== 0
      if (typeof liveValue === 'string') {
        const val = liveValue.toUpperCase()
        return val === 'PRESSED' || val === 'ON' || val === '1'
      }
    }
    if (lastMessage && typeof lastMessage === 'object') {
      if (lastMessage.value != null) return Boolean(lastMessage.value)
      if (lastMessage.state != null) {
        const state = String(lastMessage.state).toUpperCase()
        return state === 'PRESSED' || state === 'ON' || state === '1'
      }
    }
    return isLocalPressed || isPressed
  }, [liveValue, lastMessage, isPressed, isLocalPressed])

  useEffect(() => {
    // Keep parent in sync when MQTT updates
    setIsPressed(effectiveIsPressed)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveIsPressed])

  // Debug logging
  useEffect(() => {
    console.log(`🔘 Tact Button Widget Debug:`, {
      widgetId,
      stateTopic,
      commandTopic,
      valuePath,
      liveValue,
      effectiveIsPressed,
      connected: effectiveConnected,
      realtimeConnected,
      pressCount
    })
  }, [widgetId, stateTopic, commandTopic, valuePath, liveValue, effectiveIsPressed, effectiveConnected, realtimeConnected, pressCount])

  const handlePress = (e) => {
    e.preventDefault()
    setIsLocalPressed(true)
    setPressCount(prev => prev + 1)
    setIsPressed(true)
    if (commandTopic) {
      console.log(`📤 Button pressed: ${commandTopic} = ${pressPayload}`)
      // Publish press command via MQTT
    }
  }

  const handleRelease = (e) => {
    e.preventDefault()
    setIsLocalPressed(false)
    setIsPressed(false)
    if (commandTopic) {
      console.log(`📤 Button released: ${commandTopic} = ${releasePayload}`)
      // Publish release command via MQTT
    }
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
          <h3 className="text-sm font-bold text-gray-800 truncate">{title}</h3>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${effectiveConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <span className={`text-xs font-medium ${effectiveConnected ? 'text-green-600' : 'text-red-600'}`}>
            {effectiveConnected ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>
      
      {/* Button Display */}
      <div className={`flex-1 flex flex-col items-center justify-center ${isMobile ? 'p-4' : 'p-8'} bg-gradient-to-b from-white to-gray-50 min-h-0`}>
        <div className={`flex flex-col items-center ${isMobile ? 'space-y-4' : 'space-y-6'}`}>
          {/* Tact Button */}
          <div className="relative">
            {/* Button base/shadow */}
            <div 
              className="absolute inset-0 rounded-full transition-all duration-150 max-w-full max-h-full"
              style={{
                width: isMobile ? '80px' : '100px',
                height: isMobile ? '80px' : '100px',
                maxWidth: '100%',
                maxHeight: '100%',
                backgroundColor: '#1f2937',
                transform: effectiveIsPressed ? 'translateY(3px)' : 'translateY(4px)',
                filter: 'blur(4px)',
                opacity: 0.3
              }}
            ></div>
            
            {/* Button outer ring */}
            <div 
              className="relative rounded-full transition-all duration-150 flex items-center justify-center max-w-full max-h-full"
              style={{
                width: isMobile ? '80px' : '100px',
                height: isMobile ? '80px' : '100px',
                maxWidth: '100%',
                maxHeight: '100%',
                backgroundColor: '#374151',
                transform: effectiveIsPressed ? 'translateY(2px)' : 'translateY(0px)',
                boxShadow: effectiveIsPressed 
                  ? '0 1px 2px rgba(0, 0, 0, 0.2)' 
                  : '0 3px 6px rgba(0, 0, 0, 0.3)'
              }}
            >
              {/* Button inner (clickable area) */}
              <button
                onMouseDown={handlePress}
                onMouseUp={handleRelease}
                onMouseLeave={handleRelease}
                onTouchStart={handlePress}
                onTouchEnd={handleRelease}
                className="rounded-full focus:outline-none focus:ring-4 focus:ring-offset-2 transition-all duration-150 max-w-full max-h-full"
                style={{
                  width: isMobile ? '60px' : '80px',
                  height: isMobile ? '60px' : '80px',
                  maxWidth: '100%',
                  maxHeight: '100%',
                  backgroundColor: buttonColor,
                  transform: effectiveIsPressed ? 'scale(0.95)' : 'scale(1)',
                  boxShadow: effectiveIsPressed 
                    ? `inset 0 1px 2px rgba(0, 0, 0, 0.3)` 
                    : `0 1px 4px ${buttonColor}50, inset 0 -1px 1px rgba(0, 0, 0, 0.2)`,
                  focusRing: `${buttonColor}50`
                }}
              >
                {/* Button highlight */}
                <div 
                  className="absolute top-2 left-1/2 transform -translate-x-1/2 w-8 h-4 bg-white rounded-full transition-opacity duration-150"
                  style={{
                    opacity: effectiveIsPressed ? 0.1 : 0.3,
                    filter: 'blur(4px)'
                  }}
                ></div>
                
                {/* Button label */}
                <div className="flex flex-col items-center justify-center h-full max-w-full max-h-full overflow-hidden">
                  <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-bold text-white tracking-wider truncate`}>
                    {buttonLabel}
                  </span>
                </div>
              </button>
            </div>
          </div>
          
          {/* Status Display */}
          <div className="text-center max-w-full overflow-hidden">
            <div 
              className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold ${isMobile ? 'mb-1' : 'mb-2'} transition-colors duration-150 truncate`}
              style={{
                color: effectiveIsPressed ? buttonColor : '#6b7280'
              }}
            >
              {effectiveIsPressed ? 'PRESSED' : 'READY'}
            </div>
            <div className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-500 truncate`}>
              Press Count: {pressCount}
            </div>
          </div>
          
          {/* Status Indicator */}
          <div 
            className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} rounded-full transition-all duration-150`}
            style={{
              backgroundColor: effectiveIsPressed ? buttonColor : '#d1d5db',
              boxShadow: effectiveIsPressed ? `0 0 12px ${buttonColor}` : 'none'
            }}
          ></div>
        </div>
      </div>
      
      {/* Footer */}
      <div className={`${isMobile ? 'px-3 pb-3' : 'px-4 pb-4'} bg-gradient-to-r from-gray-50 to-white flex-shrink-0`}>
        <div className="flex items-center justify-between">
          <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600 font-medium truncate`}>
            {deviceInfo ? `${deviceInfo.manufacturer} ${deviceInfo.model}` : 'Tactile Button Input'}
          </div>
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full transition-all duration-150 ${
              effectiveIsPressed ? 'bg-blue-500' : 'bg-gray-400'
            }`}></div>
            <span className={`text-xs font-medium ${
              effectiveIsPressed ? 'text-blue-600' : 'text-gray-500'
            }`}>
              {effectiveIsPressed ? 'Active' : 'Idle'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

