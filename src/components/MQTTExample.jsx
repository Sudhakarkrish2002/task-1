import React, { useState, useEffect } from 'react'
import { useMQTT } from '../hooks/useMQTT'

const MQTTExample = ({ panelId = 'example-panel' }) => {
  const {
    mqttService,
    mqttStatus,
    mqttConnectionStatus,
    activeSubscriptions,
    subscribeToPanel,
    unsubscribeFromPanel,
    publishToPanel
  } = useMQTT()

  const [messages, setMessages] = useState([])
  const [testData, setTestData] = useState({ value: 0, timestamp: new Date().toISOString() })

  // Subscribe to panel when component mounts
  useEffect(() => {
    if (mqttService.isConnected && panelId) {
      const handler = (data, topic) => {
        console.log(`📨 Panel ${panelId} received:`, data)
        setMessages(prev => [...prev, { 
          topic, 
          data, 
          timestamp: new Date().toISOString() 
        }].slice(-10)) // Keep only last 10 messages
      }

      const success = subscribeToPanel(panelId, handler)
      if (success) {
        console.log(`✅ Subscribed to panel: ${panelId}`)
      }
    }

    // Cleanup subscription on unmount
    return () => {
      if (panelId) {
        unsubscribeFromPanel(panelId)
        console.log(`❌ Unsubscribed from panel: ${panelId}`)
      }
    }
  }, [panelId, mqttService.isConnected, subscribeToPanel, unsubscribeFromPanel])

  // Publish test data
  const handlePublishTest = () => {
    const newData = {
      value: Math.floor(Math.random() * 100),
      timestamp: new Date().toISOString(),
      type: 'test'
    }
    
    const success = publishToPanel(panelId, 'test-widget', newData)
    if (success) {
      setTestData(newData)
      console.log(`📤 Published test data to panel ${panelId}:`, newData)
    }
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">MQTT Connection Status</h3>
      
      {/* Connection Status */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <div className={`w-3 h-3 rounded-full ${
            mqttStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <span className="text-sm font-medium">
            Status: {mqttStatus}
          </span>
        </div>
        
        <div className="text-xs text-gray-600 space-y-1">
          <div>Connected: {mqttConnectionStatus.isConnected ? 'Yes' : 'No'}</div>
          <div>Connecting: {mqttConnectionStatus.isConnecting ? 'Yes' : 'No'}</div>
          <div>Client ID: {mqttConnectionStatus.clientId || 'N/A'}</div>
          <div>Active Subscriptions: {activeSubscriptions.length}</div>
        </div>
      </div>

      {/* Test Controls */}
      <div className="mb-4">
        <h4 className="text-md font-medium mb-2">Test Panel: {panelId}</h4>
        <button
          onClick={handlePublishTest}
          disabled={!mqttService.isConnected}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Publish Test Data
        </button>
        
        {testData && (
          <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
            <div>Last Published:</div>
            <div>Value: {testData.value}</div>
            <div>Time: {new Date(testData.timestamp).toLocaleTimeString()}</div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div>
        <h4 className="text-md font-medium mb-2">Recent Messages ({messages.length})</h4>
        <div className="max-h-40 overflow-y-auto space-y-2">
          {messages.length === 0 ? (
            <div className="text-gray-500 text-sm">No messages received yet</div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className="p-2 bg-gray-50 rounded text-xs">
                <div className="font-medium">Topic: {msg.topic}</div>
                <div>Data: {JSON.stringify(msg.data)}</div>
                <div className="text-gray-500">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default MQTTExample
