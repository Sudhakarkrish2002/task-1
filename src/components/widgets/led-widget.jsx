import React, { useEffect, useMemo, useState } from 'react'
import { useRealtimeData } from '../../hooks/useRealtimeData'

export const LEDWidget = ({ 
  widgetId,
  title = 'LED Indicator',
  panelId = 'default',
  isOn = false,
  connected = false,
  deviceInfo = null,
  color = '#22c55e', // Default green
  offColor = '#6b7280', // Default gray when off
  // Optional MQTT wiring
  stateTopic,
  valuePath,
  onValue = 1 // Value that indicates LED is on
}) => {
  // Mobile detection for responsive layout
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  // Subscribe to state topic
  const { value: liveValue, connected: realtimeConnected, lastMessage } = useRealtimeData(stateTopic, { valuePath })
  const effectiveConnected = connected || realtimeConnected
  
  // Determine LED state from live value
  const effectiveIsOn = useMemo(() => {
    if (liveValue != null) {
      if (typeof liveValue === 'boolean') return liveValue
      if (typeof liveValue === 'number') return liveValue !== 0
      if (typeof liveValue === 'string') return liveValue.toUpperCase() === 'ON' || liveValue === '1'
    }
    if (lastMessage && typeof lastMessage === 'object') {
      if (lastMessage.value != null) return Boolean(lastMessage.value)
      if (lastMessage.state != null) {
        const state = String(lastMessage.state).toUpperCase()
        return state === 'ON' || state === '1' || state === 'TRUE'
      }
    }
    return isOn
  }, [liveValue, lastMessage, isOn])

  // Debug logging
  useEffect(() => {
    console.log(`💡 LED Widget Debug:`, {
      widgetId,
      stateTopic,
      valuePath,
      liveValue,
      effectiveIsOn,
      connected: effectiveConnected,
      realtimeConnected
    })
  }, [widgetId, stateTopic, valuePath, liveValue, effectiveIsOn, effectiveConnected, realtimeConnected])

  return (
    <div className="w-full h-full bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
          <h3 className="text-sm font-bold text-gray-800 truncate">{title}</h3>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${effectiveConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <span className={`text-xs font-medium ${effectiveConnected ? 'text-green-600' : 'text-red-600'}`}>
            {effectiveConnected ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>
      
      {/* LED Display */}
      <div className={`flex-1 flex flex-col items-center justify-center ${isMobile ? 'p-4' : 'p-8'} bg-gradient-to-b from-white to-gray-50 min-h-0`}>
        <div className={`flex flex-col items-center ${isMobile ? 'space-y-4' : 'space-y-6'}`}>
          {/* LED Circle */}
          <div className="relative">
            {/* Outer glow ring */}
            <div 
              className={`absolute inset-0 rounded-full transition-all duration-500 ${
                effectiveIsOn ? 'animate-pulse' : ''
              }`}
              style={{
                width: isMobile ? '80px' : '100px',
                height: isMobile ? '80px' : '100px',
                maxWidth: '100%',
                maxHeight: '100%',
                backgroundColor: effectiveIsOn ? color : offColor,
                opacity: effectiveIsOn ? 0.3 : 0.1,
                filter: effectiveIsOn ? 'blur(15px)' : 'blur(8px)',
                transform: 'scale(1.2)'
              }}
            ></div>
            
            {/* Main LED body */}
            <div 
              className="relative rounded-full shadow-2xl transition-all duration-500 border-4 max-w-full max-h-full"
              style={{
                width: isMobile ? '80px' : '100px',
                height: isMobile ? '80px' : '100px',
                maxWidth: '100%',
                maxHeight: '100%',
                backgroundColor: effectiveIsOn ? color : offColor,
                borderColor: effectiveIsOn ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.1)',
                boxShadow: effectiveIsOn 
                  ? `0 0 20px ${color}, 0 0 40px ${color}` 
                  : '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
            >
              {/* Highlight effect */}
              <div 
                className="absolute top-4 left-4 w-8 h-8 bg-white rounded-full transition-opacity duration-500"
                style={{
                  opacity: effectiveIsOn ? 0.6 : 0.2,
                  filter: 'blur(8px)'
                }}
              ></div>
            </div>
          </div>
          
          {/* Status Text */}
          <div className="text-center max-w-full overflow-hidden">
            <div 
              className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold ${isMobile ? 'mb-1' : 'mb-2'} transition-colors duration-500 truncate`}
              style={{
                color: effectiveIsOn ? color : offColor
              }}
            >
              {effectiveIsOn ? 'ON' : 'OFF'}
            </div>
            <div className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-500 truncate`}>
              {effectiveIsOn ? 'Active' : 'Inactive'}
            </div>
          </div>
          
          {/* Status Indicators */}
          <div className="flex items-center space-x-2">
            <div 
              className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} rounded-full transition-all duration-500`}
              style={{
                backgroundColor: effectiveIsOn ? color : offColor,
                opacity: effectiveIsOn ? 1 : 0.3
              }}
            ></div>
            <div 
              className={`${isMobile ? 'w-2 h-2' : 'w-3 h-3'} rounded-full transition-all duration-500`}
              style={{
                backgroundColor: effectiveIsOn ? color : offColor,
                opacity: effectiveIsOn ? 0.7 : 0.2
              }}
            ></div>
            <div 
              className={`${isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'} rounded-full transition-all duration-500`}
              style={{
                backgroundColor: effectiveIsOn ? color : offColor,
                opacity: effectiveIsOn ? 0.4 : 0.1
              }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className={`${isMobile ? 'px-3 pb-3' : 'px-4 pb-4'} bg-gradient-to-r from-gray-50 to-white flex-shrink-0`}>
        <div className="flex items-center justify-between">
          <div className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600 font-medium truncate`}>
            {deviceInfo ? `${deviceInfo.manufacturer} ${deviceInfo.model}` : 'LED Indicator Status'}
          </div>
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full transition-all duration-500 ${
              effectiveIsOn ? 'bg-green-500' : 'bg-gray-400'
            }`}></div>
            <span className={`text-xs font-medium ${
              effectiveIsOn ? 'text-green-600' : 'text-gray-500'
            }`}>
              {effectiveIsOn ? 'Live' : 'Idle'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

