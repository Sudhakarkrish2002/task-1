import React, { useEffect, useRef } from 'react'
import { useAutoValue } from '../../hooks/useAutoValue'

export const GaugeWidget = ({ 
  widgetId,
  title = 'Gauge',
  min = 0,
  max = 100,
  unit = '%',
  color = '#ef4444',
  panelId = 'default',
  autoGenerate = true
}) => {
  const { value, connected, deviceInfo } = useAutoValue(
    widgetId, 
    'gauge', 
    { min, max, unit }, 
    panelId, 
    autoGenerate
  )
  const canvasRef = useRef(null)

  // Validate values to prevent errors
  const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0
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
    const radius = Math.max(Math.min(centerX, centerY) - 15, 10) // Ensure minimum radius

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height)

    // Background arc
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, Math.PI, 2 * Math.PI)
    ctx.lineWidth = 12
    ctx.strokeStyle = '#e5e7eb'
    ctx.stroke()

    // Value arc
    const percentage = Math.max(0, Math.min(1, (safeValue - safeMin) / (safeMax - safeMin)))
    const angle = Math.PI + (percentage * Math.PI)
    
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, Math.PI, angle)
    ctx.lineWidth = 12
    ctx.strokeStyle = color
    ctx.stroke()

    // Title text only (value is shown in overlay)
    ctx.fillStyle = '#6b7280'
    ctx.font = '12px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(title, centerX, centerY + 15)
  }, [value, min, max, unit, color, title])

  return (
    <div className="w-full h-full bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <h3 className="text-sm font-bold text-gray-800 truncate">{title}</h3>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <span className={`text-xs font-medium ${connected ? 'text-green-600' : 'text-red-600'}`}>
            {connected ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>
      
      {/* Gauge */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-b from-white to-gray-50">
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="drop-shadow-lg"
            style={{ maxWidth: '140px', maxHeight: '100px' }}
          />
          {/* Value overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800 mb-1">
                {safeValue}
              </div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {safeUnit}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="px-4 pb-4 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-600 font-medium">
            {deviceInfo ? `${deviceInfo.manufacturer} ${deviceInfo.model}` : `Range: ${safeMin} - ${safeMax} ${safeUnit}`}
          </div>
          <div className="text-xs text-gray-500">
            {Math.round(percentage)}%
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
          <div 
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-1 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  )
}