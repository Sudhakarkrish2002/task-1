import React, { useEffect, useRef, useState } from 'react'
import { useAutoValue } from '../../hooks/useAutoValue'

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

export const ChartWidget = ({ 
  widgetId,
  title = 'Chart',
  chartType = 'bar',
  color = '#ef4444',
  panelId = 'default',
  autoGenerate = true
}) => {
  const { value: data, connected, deviceInfo } = useAutoValue(
    widgetId, 
    'chart', 
    { chartType }, 
    panelId, 
    autoGenerate
  )
  const canvasRef = useRef(null)
  const isMobile = useIsMobile()

  // Validate data
  const safeData = Array.isArray(data) && data.length > 0 ? data : [10, 20, 30, 40, 50, 60, 70, 80]
  const validData = safeData.filter(val => typeof val === 'number' && !isNaN(val))

  // Draw chart
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    const width = rect.width
    const height = rect.height
    const padding = isMobile ? 12 : 20
    const chartWidth = width - (padding * 2)
    const chartHeight = height - (padding * 2)

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    if (validData.length === 0) {
      // Draw placeholder text
      ctx.fillStyle = '#6b7280'
      ctx.font = '14px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('No data available', width / 2, height / 2)
      return
    }

    // Draw bars
    const barWidth = chartWidth / validData.length
    const maxValue = Math.max(...validData)

    validData.forEach((value, index) => {
      const barHeight = (value / maxValue) * chartHeight
      const x = padding + (index * barWidth)
      const y = padding + chartHeight - barHeight

      // Bar
      ctx.fillStyle = color
      ctx.fillRect(x + 2, y, barWidth - 4, barHeight)

      // Value text
      if (barHeight > (isMobile ? 20 : 15)) {
        ctx.fillStyle = '#ffffff'
        ctx.font = `${isMobile ? '12px' : '10px'} Inter, sans-serif`
        ctx.textAlign = 'center'
        ctx.fillText(value.toString(), x + barWidth / 2, y + barHeight / 2 + 3)
      }
    })

    // Draw grid lines
    ctx.strokeStyle = '#f3f4f6'
    ctx.lineWidth = 1
    for (let i = 0; i <= 4; i++) {
      const y = padding + (chartHeight / 4) * i
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(padding + chartWidth, y)
      ctx.stroke()
    }
  }, [data, color])

  return (
    <div className="w-full h-full bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Header */}
      <div className={`flex items-center justify-between ${isMobile ? 'p-3' : 'p-4'} bg-gradient-to-r from-gray-50 to-white border-b border-gray-100`}>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <h3 className={`${isMobile ? 'text-xs' : 'text-sm'} font-bold text-gray-800 truncate`}>{title}</h3>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <span className={`${isMobile ? 'text-xs' : 'text-xs'} font-medium ${connected ? 'text-green-600' : 'text-red-600'}`}>
            {connected ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>
      
      {/* Chart */}
      <div className={`flex-1 ${isMobile ? 'p-2' : 'p-4'} bg-gradient-to-b from-white to-gray-50`}>
        <div className="relative h-full">
          <canvas
            ref={canvasRef}
            className="w-full h-full drop-shadow-sm"
            style={{ minHeight: isMobile ? '120px' : '140px' }}
          />
          {/* Chart overlay info */}
          <div className={`absolute ${isMobile ? 'top-1 right-1' : 'top-2 right-2'} bg-white/90 backdrop-blur-sm rounded-lg ${isMobile ? 'px-1 py-0.5' : 'px-2 py-1'}`}>
            <div className={`${isMobile ? 'text-xs' : 'text-xs'} font-medium text-gray-600`}>
              {validData.length} data points
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className={`${isMobile ? 'px-3 pb-3' : 'px-4 pb-4'} bg-gradient-to-r from-gray-50 to-white`}>
        <div className="flex items-center justify-between">
          <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-600 font-medium truncate`}>
            {deviceInfo ? `${deviceInfo.manufacturer} ${deviceInfo.model}` : `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`}
          </div>
          <div className="flex items-center space-x-2">
            <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-500`}>
              Max: {validData.length > 0 ? Math.max(...validData) : 0}
            </div>
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          </div>
        </div>
        {/* Chart type indicator */}
        <div className={`${isMobile ? 'mt-1' : 'mt-2'} flex items-center justify-between`}>
          <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-500`}>
            {chartType.toUpperCase()} CHART
          </div>
          <div className="flex space-x-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`${isMobile ? 'w-0.5 h-2' : 'w-1 h-3'} bg-blue-500 rounded-full opacity-60`}></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}