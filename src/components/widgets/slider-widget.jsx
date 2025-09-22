import React, { useMemo, useState } from 'react'
import { useMqttTopic } from '../../hooks/useMqttTopic'
import mqttService from '../../services/mqttService'

export const SliderWidget = ({ 
  widgetId,
  title = 'Slider',
  min = 0,
  max = 100,
  unit = '',
  color = '#ef4444',
  panelId = 'default',
  value = 50,
  connected = false,
  deviceInfo = null,
  setValue = () => {},
  // Optional MQTT wiring
  stateTopic,
  commandTopic,
  valuePath
}) => {
  const [isDragging, setIsDragging] = useState(false)


  // Live reflect via MQTT state topic
  const { value: liveValue, connected: mqttConnected } = useMqttTopic(stateTopic, { valuePath })
  const effectiveConnected = connected || mqttConnected
  const effectiveValue = useMemo(() => (typeof liveValue === 'number' ? liveValue : value), [liveValue, value])

  const handleSliderChange = (newValue) => {
    setValue(newValue)
    if (commandTopic) {
      mqttService.publish(commandTopic, newValue, { qos: 0, retain: false })
    }
  }

  // Validate values to prevent errors
  const safeValue = typeof effectiveValue === 'number' && !isNaN(effectiveValue) ? effectiveValue : 50
  const safeMin = typeof min === 'number' && !isNaN(min) ? min : 0
  const safeMax = typeof max === 'number' && !isNaN(max) ? max : 100
  const safeUnit = typeof unit === 'string' ? unit : ''
  
  const percentage = Math.max(0, Math.min(100, ((safeValue - safeMin) / (safeMax - safeMin)) * 100))

  return (
    <div className="w-full h-full bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-orange-500"></div>
          <h3 className="text-sm font-bold text-gray-800 truncate">{title}</h3>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${effectiveConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <span className={`text-xs font-medium ${effectiveConnected ? 'text-green-600' : 'text-red-600'}`}>
            {effectiveConnected ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>
      
      {/* Slider Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-white to-gray-50 min-h-0">
        <div className="w-full max-w-sm">
          {/* Value Display */}
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-gray-800 mb-2">
              {safeValue}
              <span className="text-lg text-gray-500 ml-1">{safeUnit}</span>
            </div>
            <div className="text-sm text-gray-600 font-medium">
              {Math.round(percentage)}% of range
            </div>
          </div>
          
          {/* Slider Track */}
          <div className="relative mb-4">
            <div className="w-full h-3 bg-gray-200 rounded-full shadow-inner">
              <div 
                className="h-3 rounded-full transition-all duration-500 bg-gradient-to-r from-orange-400 to-orange-500 shadow-lg"
                style={{ width: `${Math.max(2, percentage)}%` }}
              />
            </div>
            
            {/* Slider Handle */}
            <input
              type="range"
              min={safeMin}
              max={safeMax}
              value={safeValue}
              onChange={(e) => handleSliderChange(parseInt(e.target.value))}
              onMouseDown={() => setIsDragging(true)}
              onMouseUp={() => setIsDragging(false)}
              className="absolute top-0 w-full h-3 opacity-0 cursor-pointer"
            />
            
            {/* Custom Handle */}
            <div 
              className={`absolute top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full border-3 border-white shadow-xl transition-all duration-200 ${
                isDragging ? 'scale-125 shadow-2xl' : 'hover:scale-110'
              }`}
              style={{ 
                left: `calc(${Math.max(0, Math.min(100, percentage))}% - 12px)`,
                backgroundColor: color,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
            />
          </div>
          
          {/* Min/Max Labels */}
          <div className="flex justify-between text-xs text-gray-600 font-medium">
            <span className="bg-gray-100 px-2 py-1 rounded-full">{safeMin}{safeUnit}</span>
            <span className="bg-gray-100 px-2 py-1 rounded-full">{safeMax}{safeUnit}</span>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="px-4 pb-4 bg-gradient-to-r from-gray-50 to-white flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-600 font-medium">
            {deviceInfo ? `${deviceInfo.manufacturer} ${deviceInfo.model}` : 'Auto-updating'}
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-1 h-1 rounded-full bg-orange-500"></div>
            <div className="w-1 h-1 rounded-full bg-orange-400"></div>
            <div className="w-1 h-1 rounded-full bg-orange-300"></div>
          </div>
        </div>
      </div>
    </div>
  )
}