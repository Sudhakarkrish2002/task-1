import React, { useState, useEffect } from 'react'
import { Sliders } from 'lucide-react'

export const SliderWidget = ({ 
  widgetId,
  mqttTopic,
  title = 'Slider Control',
  min = 0,
  max = 100,
  value = 50,
  step = 1,
  color = '#3b82f6',
  size = 'medium'
}) => {
  const [currentValue, setCurrentValue] = useState(value)
  const [isDragging, setIsDragging] = useState(false)

  // Size configurations
  const sizeConfig = {
    small: { width: 200, height: 100 },
    medium: { width: 300, height: 150 },
    large: { width: 400, height: 180 }
  }

  const { width, height } = sizeConfig[size] || sizeConfig.medium

  // Handle slider change
  const handleSliderChange = (newValue) => {
    setCurrentValue(newValue)
    
    // MQTT integration removed
  }

  // For now, we'll skip MQTT integration

  // Calculate percentage for visual representation
  const percentage = ((currentValue - min) / (max - min)) * 100

  return (
    <div className="w-full h-full bg-white rounded-lg border border-gray-200 p-2 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <h3 className="text-sm font-semibold text-gray-900 truncate">{title}</h3>
        <div className="flex items-center space-x-1 flex-shrink-0">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-500">Live</span>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center min-h-0 overflow-hidden">
        {/* Value Display */}
        <div className="text-2xl font-bold text-gray-900 mb-3">
          {currentValue}
        </div>
        
        {/* Slider Container */}
        <div className="w-full max-w-full px-2">
          <div className="relative">
            {/* Track */}
            <div className="w-full h-2 bg-gray-200 rounded-full">
              {/* Progress */}
              <div 
                className="h-2 rounded-full transition-all duration-200"
                style={{ 
                  width: `${percentage}%`,
                  backgroundColor: color
                }}
              />
            </div>
            
            {/* Slider Handle */}
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={currentValue}
              onChange={(e) => handleSliderChange(parseInt(e.target.value))}
              onMouseDown={() => setIsDragging(true)}
              onMouseUp={() => setIsDragging(false)}
              className="absolute top-0 w-full h-2 opacity-0 cursor-pointer"
            />
            
            {/* Custom Handle */}
            <div 
              className={`absolute top-1/2 transform -translate-y-1/2 w-5 h-5 rounded-full border-2 border-white shadow-lg transition-all duration-200 ${
                isDragging ? 'scale-110' : 'hover:scale-105'
              }`}
              style={{ 
                left: `calc(${percentage}% - 10px)`,
                backgroundColor: color
              }}
            />
          </div>
          
          {/* Min/Max Labels */}
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>{min}</span>
            <span>{max}</span>
          </div>
        </div>
        
        {/* Control Buttons */}
        <div className="flex space-x-2 mt-3">
          <button
            onClick={() => handleSliderChange(Math.max(min, currentValue - step))}
            className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium transition-colors"
          >
            -
          </button>
          <button
            onClick={() => handleSliderChange(Math.min(max, currentValue + step))}
            className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs font-medium transition-colors"
          >
            +
          </button>
        </div>
      </div>
      
      <div className="mt-2 text-center flex-shrink-0">
        <div className="text-xs text-gray-600">
          Range: {min} - {max}
        </div>
        {mqttTopic && (
          <div className="text-xs text-gray-400 mt-1 truncate">
            {mqttTopic}
          </div>
        )}
      </div>
    </div>
  )
}
