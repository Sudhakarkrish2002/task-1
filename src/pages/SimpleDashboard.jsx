import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import LiveSensorData from '../components/LiveSensorData'

const SimpleDashboard = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Live Sensor Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">
                Real-time IoT sensor data monitoring
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="p-6">
        {/* Live Sensor Data */}
        <LiveSensorData />
        
        {/* Additional Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">i</span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-900 mb-1">About This Dashboard</h3>
              <p className="text-sm text-blue-700">
                This dashboard displays live sensor data using random values generated every 3 seconds. 
                In the future, this will be connected to real MQTT sensors for live IoT data monitoring.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SimpleDashboard
