import React, { useMemo, useState, useEffect } from 'react'
import { useRealtimeData } from '../../hooks/useRealtimeData'

export const SimpleSensorWidget = ({ 
  widgetId,
  title = 'Sensor',
  unit = '°C',
  min = 0,
  max = 100,
  panelId = 'default',
  value = 25,
  connected = false,
  deviceInfo = null,
  // Optional MQTT wiring
  topic,
  valuePath
}) => {
  const [trend, setTrend] = useState('stable') // 'up', 'down', 'stable'
  const [prevValue, setPrevValue] = useState(value)

  // Real-time WebSocket subscription and effective value
  const { value: liveValue, connected: realtimeConnected } = useRealtimeData(topic, { valuePath })
  const effectiveConnected = connected || realtimeConnected
  const effectiveValue = useMemo(() => (liveValue != null ? liveValue : value), [liveValue, value])

  // Track trend based on value changes
  useEffect(() => {
    if (effectiveValue !== null && prevValue !== null) {
      if (effectiveValue > prevValue) setTrend('up')
      else if (effectiveValue < prevValue) setTrend('down')
      else setTrend('stable')
    }
    setPrevValue(effectiveValue)
  }, [effectiveValue, prevValue])


  const getStatusColor = () => {
    const safeValue = typeof effectiveValue === 'number' && !isNaN(effectiveValue) ? effectiveValue : 0
    const percentage = (safeValue - min) / (max - min)
    if (percentage < 0.3) return 'text-green-600'
    if (percentage < 0.7) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return '↗'
      case 'down': return '↘'
      default: return '→'
    }
  }

  return (
    <div className="w-full h-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-800 truncate">{title}</h3>
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${effectiveConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <span className="text-xs text-gray-500">{effectiveConnected ? 'Live' : 'Offline'}</span>
        </div>
      </div>
      
      {/* Sensor Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          {/* Main Value */}
          <div className={`text-4xl font-bold mb-2 ${getStatusColor()}`}>
            {typeof effectiveValue === 'number' && !isNaN(effectiveValue) ? effectiveValue : '--'}
          </div>
          
          {/* Unit */}
          <div className="text-lg text-gray-600 mb-3">
            {unit}
          </div>
          
          {/* Trend Indicator */}
          <div className="flex items-center justify-center space-x-2">
            <span className="text-2xl">{getTrendIcon()}</span>
            <span className="text-sm text-gray-500 capitalize">{trend}</span>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="px-3 pb-2">
        <div className="text-xs text-gray-500 text-center">
          {deviceInfo ? `${deviceInfo.manufacturer} ${deviceInfo.model}` : `Range: ${min} - ${max} ${unit}`}
        </div>
      </div>
    </div>
  )
}