import React, { useEffect, useMemo, useState, useRef } from 'react'
import { useRealtimeData } from '../../hooks/useRealtimeData'

export const TerminalWidget = ({ 
  widgetId,
  title = 'Terminal',
  panelId = 'default',
  logs = [],
  connected = false,
  deviceInfo = null,
  maxLines = 50, // Maximum number of lines to keep
  // Optional MQTT wiring
  topic,
  valuePath,
  // Terminal styling options
  textColor = '#00ff00', // Default green text (classic terminal)
  backgroundColor = '#0a0a0a', // Default dark background
  fontFamily = 'monospace'
}) => {
  // Mobile detection for responsive layout
  const [isMobile, setIsMobile] = useState(false)
  const [localLogs, setLocalLogs] = useState(logs || [])
  const terminalRef = useRef(null)
  const autoScrollRef = useRef(true)
  
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  // Subscribe to terminal data topic
  const { value: liveValue, connected: realtimeConnected, lastMessage } = useRealtimeData(topic, { valuePath })
  const effectiveConnected = connected || realtimeConnected

  // Process incoming messages
  useEffect(() => {
    if (liveValue != null || lastMessage != null) {
      const newLog = formatLogEntry(liveValue || lastMessage)
      if (newLog) {
        setLocalLogs(prevLogs => {
          const updated = [...prevLogs, newLog]
          // Keep only the last maxLines entries
          return updated.slice(-maxLines)
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveValue, lastMessage])

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScrollRef.current && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [localLogs])

  // Format log entry with timestamp
  const formatLogEntry = (value) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    })
    
    let message = ''
    if (typeof value === 'string') {
      message = value
    } else if (typeof value === 'object' && value !== null) {
      if (value.message) {
        message = value.message
      } else if (value.log) {
        message = value.log
      } else if (value.text) {
        message = value.text
      } else {
        message = JSON.stringify(value)
      }
    } else {
      message = String(value)
    }
    
    return { timestamp, message, id: Date.now() + Math.random() }
  }

  // Handle scroll detection for auto-scroll toggle
  const handleScroll = () => {
    if (terminalRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = terminalRef.current
      // If user scrolls away from bottom, disable auto-scroll
      autoScrollRef.current = scrollTop + clientHeight >= scrollHeight - 10
    }
  }

  // Clear all logs
  const handleClear = () => {
    setLocalLogs([])
  }

  // Debug logging
  useEffect(() => {
    console.log(`💻 Terminal Widget Debug:`, {
      widgetId,
      topic,
      valuePath,
      liveValue,
      logsCount: localLogs.length,
      connected: effectiveConnected,
      realtimeConnected
    })
  }, [widgetId, topic, valuePath, liveValue, localLogs.length, effectiveConnected, realtimeConnected])

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gray-700 shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <h3 className="text-sm font-bold text-gray-300 truncate ml-2">{title}</h3>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleClear}
            className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors duration-200"
            title="Clear terminal"
          >
            Clear
          </button>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${effectiveConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className={`text-xs font-medium ${effectiveConnected ? 'text-green-400' : 'text-red-400'}`}>
              {effectiveConnected ? 'Live' : 'Offline'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Terminal Display */}
      <div 
        ref={terminalRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overflow-x-hidden p-3 font-mono text-sm leading-relaxed scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900"
        style={{
          backgroundColor: backgroundColor,
          color: textColor,
          fontFamily: fontFamily
        }}
      >
        {localLogs.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-600">
              <div className="text-2xl mb-2">💻</div>
              <div className="text-sm">Waiting for data...</div>
              <div className="text-xs mt-1">Terminal output will appear here</div>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {localLogs.map((log, index) => (
              <div key={log.id || index} className="flex items-start space-x-2 hover:bg-gray-800 hover:bg-opacity-30 px-1 py-0.5 rounded transition-colors duration-150">
                <span className="text-gray-500 text-xs flex-shrink-0" style={{ minWidth: '70px' }}>
                  [{log.timestamp}]
                </span>
                <span className="text-xs break-all" style={{ color: textColor }}>
                  {log.message}
                </span>
              </div>
            ))}
            {/* Cursor blink effect at the end */}
            <div className="flex items-center space-x-1 mt-2">
              <span className="text-green-400">$</span>
              <span className="inline-block w-2 h-4 bg-green-400 animate-pulse"></span>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer / Status Bar */}
      <div className="px-3 py-2 bg-gradient-to-r from-gray-800 to-gray-900 border-t border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-400 font-medium`}>
              {deviceInfo ? `${deviceInfo.manufacturer} ${deviceInfo.model}` : 'Terminal Output'}
            </div>
            <div className="text-xs text-gray-500">
              Lines: {localLogs.length}/{maxLines}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${autoScrollRef.current ? 'bg-blue-500' : 'bg-gray-500'}`}></div>
            <span className="text-xs text-gray-500">
              {autoScrollRef.current ? 'Auto-scroll' : 'Manual'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

