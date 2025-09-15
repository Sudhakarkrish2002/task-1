import React, { useState, useEffect } from 'react'

export const ToggleWidget = ({ 
  name, 
  status: initialStatus = false, 
  widgetId,
  onToggle 
}) => {
  const [status, setStatus] = useState(initialStatus)
  const [connected, setConnected] = useState(true) // Mock connection status

  // Update local state when prop changes
  useEffect(() => {
    setStatus(initialStatus)
  }, [initialStatus])

  const handleToggle = () => {
    const newStatus = !status
    setStatus(newStatus)
    
    // Notify parent component of the toggle
    if (onToggle) {
      onToggle(newStatus)
    }
    
    // Dispatch event for grid system to handle
    if (widgetId) {
      const updateEvent = new CustomEvent('updateGridWidget', {
        detail: { 
          widgetId, 
          updates: { status: newStatus } 
        }
      })
      window.dispatchEvent(updateEvent)
    }
  }

  return (
    <div className="w-full h-full bg-white rounded-lg border border-gray-200 p-1.5 sm:p-2 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-1 sm:mb-2 flex-shrink-0">
        <h3 className="text-xs sm:text-sm font-semibold text-gray-900 truncate">{name}</h3>
        <div className="flex items-center space-x-1 flex-shrink-0">
          <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <span className="text-xs text-gray-500 hidden sm:inline">{connected ? 'Live' : 'Offline'}</span>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center min-h-0 overflow-hidden">
        <button
          onClick={handleToggle}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer ${
            status ? 'bg-blue-500' : 'bg-gray-300'
          }`}
          aria-label={`Toggle ${name} ${status ? 'off' : 'on'}`}
          role="switch"
          aria-checked={status}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
              status ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        <div className={`text-xs font-medium transition-colors mt-2 ${
          status ? 'text-blue-600' : 'text-gray-500'
        }`}>
          {status ? 'ON' : 'OFF'}
        </div>
      </div>
    </div>
  )
}
