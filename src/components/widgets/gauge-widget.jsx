import React, { useEffect, useRef, useState } from 'react'

export const GaugeWidget = ({ 
  widgetId,
  mqttTopic,
  title = 'Gauge',
  value = 0, 
  max = 100, 
  min = 0,
  unit = '',
  label, 
  color = 'primary',
  size = 'medium'
}) => {
  const canvasRef = useRef(null)
  const [currentValue, setCurrentValue] = useState(value)
  const [connected, setConnected] = useState(false)
  
  // Use provided value
  useEffect(() => {
    if (value !== undefined) {
      setCurrentValue(value)
    }
  }, [value])

  // MQTT data subscription
  useEffect(() => {
    if (!mqttTopic) return

    const handleMqttData = (message, topic) => {
      if (topic === mqttTopic && message.value !== undefined) {
        setConnected(true)
        setCurrentValue(message.value)
      }
    }

    // Generate mock data for demo
    const generateMockData = () => {
      const newData = {
        timestamp: new Date().toISOString(),
        value: Math.random() * (max - min) + min,
        topic: mqttTopic
      }
      handleMqttData(newData)
    }

    // Set up mock data generation
    const interval = setInterval(generateMockData, 2000)
    setConnected(true)

    return () => {
      clearInterval(interval)
    }
  }, [mqttTopic])

  // Determine color based on value and thresholds
  const getGaugeColor = (val) => {
    if (val < (max - min) * 0.3) return 'success'
    if (val < (max - min) * 0.7) return 'warning'
    return 'error'
  }

  const gaugeColor = getGaugeColor(currentValue)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Get the actual display size
    const rect = canvas.getBoundingClientRect()
    const displayWidth = rect.width
    const displayHeight = rect.height

    // Set the internal resolution to match the display size
    canvas.width = displayWidth * window.devicePixelRatio
    canvas.height = displayHeight * window.devicePixelRatio

    // Scale the context to match the device pixel ratio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    // Clear canvas
    ctx.clearRect(0, 0, displayWidth, displayHeight)

    // Draw gauge
    const centerX = displayWidth / 2
    const centerY = displayHeight / 2
    const radius = Math.min(centerX, centerY) - 20

    // Background arc
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, Math.PI, 2 * Math.PI)
    ctx.lineWidth = 15
    ctx.strokeStyle = '#e2e8f0'
    ctx.stroke()

    // Value arc
    const percentage = (currentValue - min) / (max - min)
    const angle = Math.PI + (percentage * Math.PI)
    
    // Color mapping
    const colorMap = {
      primary: '#3b82f6',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      accent: '#06b6d4'
    }
    
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, Math.PI, angle)
    ctx.lineWidth = 15
    ctx.strokeStyle = colorMap[gaugeColor] || colorMap.primary
    ctx.stroke()

    // Value text
    ctx.fillStyle = '#1e293b'
    ctx.font = 'bold 18px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`${currentValue}${unit}`, centerX, centerY + 6)

    // Label text
    ctx.fillStyle = '#64748b'
    ctx.font = '12px Inter, sans-serif'
    ctx.fillText(label || title, centerX, centerY + 25)
  }, [currentValue, max, min, unit, label, title, gaugeColor])

  return (
    <div className="w-full h-full bg-white rounded-lg border border-gray-200 p-2 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <h3 className="text-sm font-semibold text-gray-900 truncate">{title}</h3>
        <div className="flex items-center space-x-1 flex-shrink-0">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <span className="text-xs text-gray-500">{connected ? 'Live' : 'Offline'}</span>
        </div>
      </div>
      
      <div className="flex-1 flex items-center justify-center min-h-0 overflow-hidden">
        <div className="relative w-full h-full flex items-center justify-center">
          <canvas
            ref={canvasRef}
            className="w-full h-full max-w-full max-h-full"
            style={{ 
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain'
            }}
          />
        </div>
      </div>
      
      <div className="mt-2 text-center flex-shrink-0">
        <div className="text-xs text-gray-600">
          {mqttTopic && (
            <div className="text-xs text-gray-400 mt-1 truncate">
              {mqttTopic}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
