import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useRealtimeData } from '../../hooks/useRealtimeData'

// Mobile detection hook
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])
  
  return isMobile
}

export const GaugeWidget = ({ 
  widgetId,
  title = 'Gauge',
  min = 0,
  max = 100,
  unit = '%',
  color = '#ef4444',
  panelId = 'default',
  value = 50,
  connected = false,
  deviceInfo = null,
  // Optional MQTT wiring
  topic,
  valuePath
}) => {
  const canvasRef = useRef(null)
  const isMobile = useIsMobile()

  // Real-time WebSocket subscription
  const { value: liveValue, connected: realtimeConnected } = useRealtimeData(topic, { valuePath })
  const effectiveConnected = connected || realtimeConnected
  const effectiveValue = useMemo(() => (liveValue != null ? liveValue : value), [liveValue, value])

  // Debug logging
  useEffect(() => {
    console.log(`🔧 Gauge Widget Debug:`, {
      widgetId,
      topic,
      valuePath,
      liveValue,
      effectiveValue,
      connected: effectiveConnected,
      realtimeConnected
    })
  }, [widgetId, topic, valuePath, liveValue, effectiveValue, effectiveConnected, realtimeConnected])

  // Validate values to prevent errors
  const safeValue = typeof effectiveValue === 'number' && !isNaN(effectiveValue) ? effectiveValue : 0
  const safeMin = typeof min === 'number' && !isNaN(min) ? min : 0
  const safeMax = typeof max === 'number' && !isNaN(max) ? max : 100
  const safeUnit = typeof unit === 'string' ? unit : ''
  const percentage = Math.max(0, Math.min(1, (safeValue - safeMin) / (safeMax - safeMin))) * 100

  // Draw gauge with sharper semi-circular arc
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const centerX = rect.width / 2
    const centerY = rect.height * 0.75 // Lower centerY to accommodate text below
    const radius = Math.max(Math.min(centerX, centerY) * 0.8, 25) // Increased radius with better scaling

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height)

    // Calculate percentage for filling
    const fillPercentage = Math.max(0, Math.min(1, (safeValue - safeMin) / (safeMax - safeMin)))
    
    // Set line cap to square for sharper edges
    ctx.lineCap = 'square'
    
    // Background arc (unfilled portion) - Semi-circular with sharper edges
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, Math.PI, 2 * Math.PI)
    ctx.lineWidth = isMobile ? 20 : 16
    ctx.strokeStyle = '#e5e7eb'
    ctx.stroke()

    // Value arc (filled portion) - Semi-circular with sharper edges
    if (fillPercentage > 0) {
      const startAngle = Math.PI // Start from left (180 degrees)
      const endAngle = Math.PI + (fillPercentage * Math.PI) // End based on percentage
      
      ctx.beginPath()
      ctx.arc(centerX, centerY, radius, startAngle, endAngle)
      ctx.lineWidth = isMobile ? 20 : 16
      ctx.strokeStyle = color
      ctx.stroke()
    }
  }, [safeValue, min, max, unit, color, title, isMobile])

  return (
    <div className="w-full h-full bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <h3 className="text-sm font-bold text-gray-800 truncate">{title}</h3>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${effectiveConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <span className={`text-xs font-medium ${effectiveConnected ? 'text-green-600' : 'text-red-600'}`}>
            {effectiveConnected ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>
      
      {/* Gauge */}
      <div className={`flex-1 flex items-center justify-center ${isMobile ? 'p-3' : 'p-4'} bg-gradient-to-b from-white to-gray-50`}>
        <div className="relative w-full h-full flex items-center justify-center">
          <canvas
            ref={canvasRef}
            className="drop-shadow-lg max-w-full max-h-full"
            style={{ 
              width: isMobile ? '280px' : '260px', 
              height: isMobile ? '140px' : '120px',
              maxWidth: '100%',
              maxHeight: '100%'
            }}
          />
          {/* Value display at the center line of the arc */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-2" style={{ marginTop: isMobile ? '35px' : '30px' }}>
              <div className={`${isMobile ? 'text-4xl' : 'text-3xl'} font-bold text-gray-800 leading-none`}>
                {safeValue}
              </div>
              <div className={`${isMobile ? 'text-lg' : 'text-base'} font-semibold text-gray-500 uppercase tracking-wide mt-1`}>
                {safeUnit}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className={`${isMobile ? 'px-3 pb-3' : 'px-4 pb-4'} bg-gradient-to-r from-gray-50 to-white`}>
        <div className="flex items-center justify-between">
          <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-600 font-medium truncate`}>
            {deviceInfo ? `${deviceInfo.manufacturer} ${deviceInfo.model}` : `Range: ${safeMin} - ${safeMax} ${safeUnit}`}
          </div>
          <div className={`${isMobile ? 'text-sm' : 'text-xs'} text-gray-500 font-semibold`}>
            {Math.round(percentage)}%
          </div>
        </div>
        {/* Progress bar */}
        <div className={`${isMobile ? 'mt-2' : 'mt-2'} w-full bg-gray-200 rounded-full ${isMobile ? 'h-2' : 'h-1'}`}>
          <div 
            className="rounded-full transition-all duration-500"
            style={{ 
              width: `${percentage}%`, 
              height: isMobile ? '8px' : '4px',
              backgroundColor: color
            }}
          ></div>
        </div>
      </div>
    </div>
  )
}