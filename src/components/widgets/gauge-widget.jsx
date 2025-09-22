import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useMqttTopic } from '../../hooks/useMqttTopic'

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

  // MQTT subscription
  const { value: liveValue, connected: mqttConnected } = useMqttTopic(topic, { valuePath })
  const effectiveConnected = connected || mqttConnected
  const effectiveValue = useMemo(() => (liveValue != null ? liveValue : value), [liveValue, value])

  // Validate values to prevent errors
  const safeValue = typeof effectiveValue === 'number' && !isNaN(effectiveValue) ? effectiveValue : 0
  const safeMin = typeof min === 'number' && !isNaN(min) ? min : 0
  const safeMax = typeof max === 'number' && !isNaN(max) ? max : 100
  const safeUnit = typeof unit === 'string' ? unit : ''
  const percentage = Math.max(0, Math.min(1, (safeValue - safeMin) / (safeMax - safeMin))) * 100

  // Draw gauge
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
    const radius = Math.max(Math.min(centerX, centerY) - (isMobile ? 20 : 15), 10) // Larger radius for mobile

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height)

    // Background arc
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, Math.PI, 2 * Math.PI)
    ctx.lineWidth = isMobile ? 16 : 12 // Thicker line for mobile
    ctx.strokeStyle = '#e5e7eb'
    ctx.stroke()

    // Value arc
    const percentage = Math.max(0, Math.min(1, (safeValue - safeMin) / (safeMax - safeMin)))
    const angle = Math.PI + (percentage * Math.PI)
    
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, Math.PI, angle)
    ctx.lineWidth = isMobile ? 16 : 12 // Thicker line for mobile
    ctx.strokeStyle = color
    ctx.stroke()

    // Title text only (value is shown in overlay)
    ctx.fillStyle = '#6b7280'
    ctx.font = `${isMobile ? '14px' : '12px'} Inter, sans-serif` // Larger font for mobile
    ctx.textAlign = 'center'
    ctx.fillText(title, centerX, centerY + (isMobile ? 20 : 15))
  }, [value, min, max, unit, color, title, isMobile])

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
            className="drop-shadow-lg"
            style={{ 
              maxWidth: isMobile ? '180px' : '140px', 
              maxHeight: isMobile ? '120px' : '100px' 
            }}
          />
          {/* Value overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`${isMobile ? 'text-3xl' : 'text-2xl'} font-bold text-gray-800 mb-1`}>
                {safeValue}
              </div>
              <div className={`${isMobile ? 'text-sm' : 'text-xs'} font-medium text-gray-500 uppercase tracking-wide`}>
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
            className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%`, height: isMobile ? '8px' : '4px' }}
          ></div>
        </div>
      </div>
    </div>
  )
}