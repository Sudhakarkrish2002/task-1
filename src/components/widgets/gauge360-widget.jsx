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

export const Gauge360Widget = ({ 
  widgetId,
  title = '360° Gauge',
  min = 0,
  max = 360,
  unit = '°',
  color = '#3b82f6',
  panelId = 'default',
  value = 180,
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
    console.log(`🔧 360° Gauge Widget Debug:`, {
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
  const safeMax = typeof max === 'number' && !isNaN(max) ? max : 360
  const safeUnit = typeof unit === 'string' ? unit : ''
  const percentage = Math.max(0, Math.min(1, (safeValue - safeMin) / (safeMax - safeMin))) * 100

  // Draw 360° gauge
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const radius = Math.max(Math.min(centerX, centerY) - (isMobile ? 25 : 20), 10)

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height)

    // Calculate percentage for filling (full circle)
    const percentage = Math.max(0, Math.min(1, (safeValue - safeMin) / (safeMax - safeMin)))
    
    // Background arc (full circle - unfilled portion)
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
    ctx.lineWidth = isMobile ? 16 : 12
    ctx.strokeStyle = '#e5e7eb'
    ctx.stroke()

    // Value arc (filled portion) - draw full circle based on percentage
    const startAngle = -Math.PI / 2 // Start from top (12 o'clock)
    const endAngle = startAngle + (percentage * 2 * Math.PI) // End based on percentage
    
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, startAngle, endAngle)
    ctx.lineWidth = isMobile ? 16 : 12
    ctx.strokeStyle = color
    ctx.stroke()
    
    // Add a filled circle at the end of the arc to show current position
    if (percentage > 0) {
      const endX = centerX + radius * Math.cos(endAngle)
      const endY = centerY + radius * Math.sin(endAngle)
      
      ctx.beginPath()
      ctx.arc(endX, endY, (isMobile ? 8 : 6), 0, 2 * Math.PI)
      ctx.fillStyle = color
      ctx.fill()
      
      // Add a white inner circle for contrast
      ctx.beginPath()
      ctx.arc(endX, endY, (isMobile ? 4 : 3), 0, 2 * Math.PI)
      ctx.fillStyle = '#ffffff'
      ctx.fill()
    }

    // Draw center point
    ctx.beginPath()
    ctx.arc(centerX, centerY, (isMobile ? 6 : 4), 0, 2 * Math.PI)
    ctx.fillStyle = color
    ctx.fill()

    // Draw tick marks for 0°, 90°, 180°, 270°
    const tickAngles = [0, 90, 180, 270]
    ctx.strokeStyle = '#9ca3af'
    ctx.lineWidth = 2
    
    tickAngles.forEach(angle => {
      const rad = (angle - 90) * Math.PI / 180
      const innerRadius = radius - (isMobile ? 12 : 8)
      const outerRadius = radius + (isMobile ? 6 : 4)
      
      ctx.beginPath()
      ctx.moveTo(centerX + innerRadius * Math.cos(rad), centerY + innerRadius * Math.sin(rad))
      ctx.lineTo(centerX + outerRadius * Math.cos(rad), centerY + outerRadius * Math.sin(rad))
      ctx.stroke()
    })
  }, [safeValue, min, max, color, isMobile])

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
      <div className={`flex-1 flex items-center justify-center ${isMobile ? 'p-4' : 'p-6'} bg-gradient-to-b from-white to-gray-50`}>
        <div className="relative">
            <canvas
              ref={canvasRef}
              className="drop-shadow-lg max-w-full max-h-full"
              style={{ 
                width: isMobile ? '140px' : '120px', 
                height: isMobile ? '140px' : '120px',
                maxWidth: '100%',
                maxHeight: '100%'
              }}
            />
          {/* Value overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center max-w-full max-h-full overflow-hidden">
              <div className={`${isMobile ? 'text-xl' : 'text-lg'} font-bold text-gray-800 mb-1 truncate`}>
                {safeValue}
              </div>
              <div className={`${isMobile ? 'text-xs' : 'text-xs'} font-medium text-gray-500 uppercase tracking-wide truncate`}>
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

