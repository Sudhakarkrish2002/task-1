import React, { useState, useEffect } from 'react'
import { Activity, Thermometer, Droplets, Gauge, Zap, Eye, AlertTriangle, Clock } from 'lucide-react'

const LiveSensorData = () => {
  const [sensorData, setSensorData] = useState({})
  const [lastUpdate, setLastUpdate] = useState(null)

  // Generate random sensor data
  const generateRandomData = () => {
    const sensors = [
      { id: 'temp-01', name: 'Temperature Sensor', type: 'temperature', unit: '°C', min: 20, max: 30 },
      { id: 'humidity-01', name: 'Humidity Sensor', type: 'humidity', unit: '%', min: 40, max: 70 },
      { id: 'pressure-01', name: 'Pressure Sensor', type: 'pressure', unit: 'hPa', min: 1000, max: 1020 },
      { id: 'light-01', name: 'Light Sensor', type: 'light', unit: 'lux', min: 0, max: 1000 },
      { id: 'motion-01', name: 'Motion Sensor', type: 'motion', unit: '', min: 0, max: 1 },
      { id: 'co2-01', name: 'CO2 Sensor', type: 'co2', unit: 'ppm', min: 400, max: 600 },
      { id: 'voltage-01', name: 'Voltage Sensor', type: 'voltage', unit: 'V', min: 12, max: 16 },
      { id: 'current-01', name: 'Current Sensor', type: 'current', unit: 'A', min: 0, max: 5 }
    ]

    const newData = {}
    sensors.forEach(sensor => {
      let value
      if (sensor.type === 'motion') {
        value = Math.random() > 0.7 ? 1 : 0
      } else {
        value = sensor.min + Math.random() * (sensor.max - sensor.min)
      }

      newData[sensor.id] = {
        id: sensor.id,
        name: sensor.name,
        type: sensor.type,
        value: Math.round(value * 100) / 100,
        unit: sensor.unit,
        timestamp: new Date().toISOString(),
        status: getStatus(sensor.type, value)
      }
    })

    setSensorData(newData)
    setLastUpdate(new Date())
  }

  const getStatus = (type, value) => {
    switch (type) {
      case 'temperature':
        if (value < 0) return 'critical'
        if (value > 40) return 'warning'
        return 'normal'
      case 'humidity':
        if (value < 20 || value > 80) return 'warning'
        return 'normal'
      case 'pressure':
        if (value < 980 || value > 1030) return 'warning'
        return 'normal'
      case 'co2':
        if (value > 1000) return 'warning'
        if (value > 1500) return 'critical'
        return 'normal'
      case 'voltage':
        if (value < 10 || value > 20) return 'warning'
        return 'normal'
      case 'current':
        if (value > 8) return 'warning'
        return 'normal'
      default:
        return 'normal'
    }
  }

  const getSensorIcon = (type) => {
    switch (type) {
      case 'temperature': return <Thermometer className="w-5 h-5" />
      case 'humidity': return <Droplets className="w-5 h-5" />
      case 'pressure': return <Gauge className="w-5 h-5" />
      case 'light': return <Eye className="w-5 h-5" />
      case 'motion': return <Activity className="w-5 h-5" />
      case 'voltage': return <Zap className="w-5 h-5" />
      case 'co2': return <AlertTriangle className="w-5 h-5" />
      default: return <Activity className="w-5 h-5" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'normal': return 'text-green-600 bg-green-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      case 'critical': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  // Generate initial data and set up interval
  useEffect(() => {
    generateRandomData() // Generate initial data
    
    const interval = setInterval(() => {
      generateRandomData()
    }, 3000) // Update every 3 seconds

    return () => clearInterval(interval)
  }, [])

  const sensorDataArray = Object.values(sensorData)

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
          <h2 className="text-xl font-bold text-gray-900">Live Sensor Data</h2>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>{lastUpdate ? `Last update: ${lastUpdate.toLocaleTimeString()}` : 'Initializing...'}</span>
        </div>
      </div>

      {sensorDataArray.length === 0 ? (
        <div className="text-center py-8">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Loading sensor data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sensorDataArray.map((sensor) => (
            <div key={sensor.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getSensorIcon(sensor.type)}
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {sensor.name}
                  </span>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(sensor.status)}`}>
                  {sensor.status}
                </span>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {sensor.value}{sensor.unit}
                </div>
                <div className="text-xs text-gray-500 capitalize">
                  {sensor.type.replace('_', ' ')}
                </div>
              </div>
              
              <div className="mt-3 text-xs text-gray-400 text-center">
                {new Date(sensor.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Status Info */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Data Source</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-600">Random Data (Demo Mode)</span>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Updates every 3 seconds • {sensorDataArray.length} sensors active • Ready for MQTT integration
        </div>
      </div>
    </div>
  )
}

export default LiveSensorData
