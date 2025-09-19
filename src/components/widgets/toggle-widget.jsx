import React, { useState, useEffect } from 'react'
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

  // Mobile detection for responsive layout
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])


  const handleToggle = () => {
    setIsOn(prev => !prev)
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
          <h3 className="text-lg font-bold text-gray-800 truncate">{title}</h3>
        </div>
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <span className={`text-sm font-medium ${connected ? 'text-green-600' : 'text-red-600'}`}>
            {connected ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>
      
      {/* Toggle Switch */}
      <div className={`flex-1 flex flex-col items-center justify-center ${isMobile ? 'p-4' : 'p-8'} bg-gradient-to-b from-white to-gray-50 min-h-0`}>
        <div className={`flex flex-col items-center ${isMobile ? 'space-y-4' : 'space-y-6'}`}>
          {/* Toggle Button */}
          <button
            onClick={handleToggle}
            className={`toggle-button relative inline-flex h-14 w-28 items-center rounded-full transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-offset-1 shadow-lg hover:shadow-xl ${
              isOn 
                ? 'bg-gradient-to-r from-green-400 to-green-500 focus:ring-green-300' 
                : 'bg-gradient-to-r from-gray-300 to-gray-400 focus:ring-gray-300'
            }`}
          >
            <span
              className={`toggle-knob inline-block h-12 w-12 transform rounded-full bg-white shadow-xl transition-all duration-500 ${
                isOn ? 'translate-x-14' : 'translate-x-1'
              }`}
            />
            {/* Toggle Icons */}
            <div className="absolute inset-0 flex items-center justify-between px-3">
              <div className={`text-white text-sm font-bold transition-opacity duration-300 ${isOn ? 'opacity-0' : 'opacity-100'}`}>
                OFF
              </div>
              <div className={`text-white text-sm font-bold transition-opacity duration-300 ${isOn ? 'opacity-100' : 'opacity-0'}`}>
                ON
              </div>
            </div>
          </button>
          
          {/* Status Display */}
          <div className="text-center">
            <div className={`${isMobile ? 'text-2xl' : 'text-4xl'} font-bold ${isMobile ? 'mb-1' : 'mb-2'} transition-colors duration-300 ${
              isOn ? 'text-green-600' : 'text-gray-500'
            }`}>
              {isOn ? 'ON' : 'OFF'}
            </div>
            <div className={`${isMobile ? 'text-sm' : 'text-base'} font-medium transition-colors duration-300 ${
              isOn ? 'text-green-600' : 'text-gray-500'
            }`}>
              {isMobile ? (isOn ? 'Active' : 'Inactive') : (isOn ? 'Device Active' : 'Device Inactive')}
            </div>
          </div>
          
          {/* Status Indicator */}
          <div className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} rounded-full transition-all duration-500 ${
            isOn ? 'bg-green-500 animate-pulse shadow-xl' : 'bg-gray-400'
          }`}></div>
        </div>
      </div>
      
      {/* Footer */}
      <div className={`${isMobile ? 'px-4 pb-4' : 'px-6 pb-6'} bg-gradient-to-r from-gray-50 to-white flex-shrink-0`}>
        <div className="flex items-center justify-between">
          <div className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-600 font-medium ${isMobile ? 'truncate' : ''}`}>
            {isMobile 
              ? (deviceInfo ? `${deviceInfo.manufacturer}` : 'Toggle manually')
              : (deviceInfo ? `${deviceInfo.manufacturer} ${deviceInfo.model}` : 'Click to toggle manually')
            }
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              isOn ? 'bg-green-500' : 'bg-gray-400'
            }`}></div>
            <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              isOn ? 'bg-green-400' : 'bg-gray-300'
            }`}></div>
            <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              isOn ? 'bg-green-300' : 'bg-gray-200'
            }`}></div>
          </div>
        </div>
      </div>
    </div>
  )
}