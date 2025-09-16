import React from 'react'
import { useAutoValue } from '../../hooks/useAutoValue'

export const ToggleWidget = ({ 
  widgetId,
  title = 'Toggle',
  panelId = 'default',
  autoGenerate = true
}) => {
  const { value: isOn, connected, setValue: setIsOn, deviceInfo } = useAutoValue(
    widgetId, 
    'toggle', 
    {}, 
    panelId, 
    autoGenerate
  )


  const handleToggle = () => {
    setIsOn(prev => !prev)
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-purple-500"></div>
          <h3 className="text-sm font-bold text-gray-800 truncate">{title}</h3>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <span className={`text-xs font-medium ${connected ? 'text-green-600' : 'text-red-600'}`}>
            {connected ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>
      
      {/* Toggle Switch */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-white to-gray-50">
        <div className="flex flex-col items-center space-y-6">
          {/* Toggle Button */}
          <button
            onClick={handleToggle}
            className={`relative inline-flex h-16 w-28 items-center rounded-full transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-offset-2 shadow-lg hover:shadow-xl ${
              isOn 
                ? 'bg-gradient-to-r from-green-400 to-green-500 focus:ring-green-300' 
                : 'bg-gradient-to-r from-gray-300 to-gray-400 focus:ring-gray-300'
            }`}
          >
            <span
              className={`inline-block h-12 w-12 transform rounded-full bg-white shadow-xl transition-all duration-500 ${
                isOn ? 'translate-x-14' : 'translate-x-2'
              }`}
            />
            {/* Toggle Icons */}
            <div className="absolute inset-0 flex items-center justify-between px-3">
              <div className={`text-white text-xs font-bold transition-opacity duration-300 ${isOn ? 'opacity-0' : 'opacity-100'}`}>
                OFF
              </div>
              <div className={`text-white text-xs font-bold transition-opacity duration-300 ${isOn ? 'opacity-100' : 'opacity-0'}`}>
                ON
              </div>
            </div>
          </button>
          
          {/* Status Display */}
          <div className="text-center">
            <div className={`text-3xl font-bold mb-2 transition-colors duration-300 ${
              isOn ? 'text-green-600' : 'text-gray-500'
            }`}>
              {isOn ? 'ON' : 'OFF'}
            </div>
            <div className={`text-sm font-medium transition-colors duration-300 ${
              isOn ? 'text-green-600' : 'text-gray-500'
            }`}>
              {isOn ? 'Device Active' : 'Device Inactive'}
            </div>
          </div>
          
          {/* Status Indicator */}
          <div className={`w-4 h-4 rounded-full transition-all duration-500 ${
            isOn ? 'bg-green-500 animate-pulse shadow-lg' : 'bg-gray-400'
          }`}></div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="px-4 pb-4 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-600 font-medium">
            {deviceInfo ? `${deviceInfo.manufacturer} ${deviceInfo.model}` : 'Click to toggle manually'}
          </div>
          <div className="flex items-center space-x-1">
            <div className={`w-1 h-1 rounded-full transition-colors duration-300 ${
              isOn ? 'bg-green-500' : 'bg-gray-400'
            }`}></div>
            <div className={`w-1 h-1 rounded-full transition-colors duration-300 ${
              isOn ? 'bg-green-400' : 'bg-gray-300'
            }`}></div>
            <div className={`w-1 h-1 rounded-full transition-colors duration-300 ${
              isOn ? 'bg-green-300' : 'bg-gray-200'
            }`}></div>
          </div>
        </div>
      </div>
    </div>
  )
}