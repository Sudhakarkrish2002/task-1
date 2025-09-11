import React from 'react'

export const SimpleSensorWidget = ({ 
  value, 
  title = 'Sensor',
  unit = ''
}) => {
  return (
    <div className="w-full h-full flex flex-col bg-white rounded-lg border border-gray-200 relative overflow-hidden">
      {/* Live Indicator */}
      <div className="absolute top-2 right-2 flex items-center space-x-1 z-10">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
        <span className="text-xs text-gray-500">Live</span>
      </div>
      
      {/* Content Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-3 pt-8 min-h-0">
        {/* Title */}
        <h3 className="text-sm font-semibold text-gray-700 mb-3 text-center truncate w-full">{title}</h3>
        
        {/* Value */}
        <div className="text-3xl font-bold text-gray-900 text-center break-words">
          {value}{unit}
        </div>
      </div>
    </div>
  )
}
