import React, { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useAutoValue } from '../../hooks/useAutoValue'

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom device icons
const createDeviceIcon = (deviceType, status) => {
  const colors = {
    online: '#10b981',
    offline: '#ef4444',
    warning: '#f59e0b'
  }
  
  const icons = {
    sensor: '📡',
    camera: '📹',
    actuator: '⚙️',
    gateway: '🌐'
  }
  
  return L.divIcon({
    html: `
      <div style="
        background-color: ${colors[status] || colors.offline};
        border: 2px solid white;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">
        ${icons[deviceType] || '📱'}
      </div>
    `,
    className: 'custom-device-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  })
}

// Component to update map center when devices change
const MapUpdater = ({ devices }) => {
  const map = useMap()
  
  useEffect(() => {
    if (devices.length > 0) {
      const bounds = L.latLngBounds(devices.map(device => [device.lat, device.lng]))
      map.fitBounds(bounds, { padding: [20, 20] })
    }
  }, [devices, map])
  
  return null
}

export const MapWidget = ({ 
  widgetId,
  title = 'Device Map',
  center = [37.7749, -122.4194], // San Francisco default
  zoom = 10,
  size = 'medium',
  mqttTopic = null,
  panelId = 'default',
  autoGenerate = true
}) => {
  const { value: devices, connected, deviceInfo } = useAutoValue(
    widgetId, 
    'map', 
    { center, zoom }, 
    panelId, 
    autoGenerate
  )

  // Ensure devices is always an array
  const safeDevices = Array.isArray(devices) ? devices : []

  // Size configurations
  const sizeConfig = {
    small: { width: 250, height: 150 },
    medium: { width: 400, height: 250 },
    large: { width: 500, height: 300 }
  }

  const { width, height } = sizeConfig[size] || sizeConfig.medium


  // Subscribe to MQTT topic for device updates
  useEffect(() => {
    if (!mqttTopic) return

    const handleMqttMessage = (topic, messageData) => {
      if (topic === mqttTopic) {
        // Update device data based on MQTT message
        setDevices(prevDevices => 
          prevDevices.map(device => {
            if (device.id === messageData.deviceId) {
              return {
                ...device,
                data: { ...device.data, ...messageData },
                status: messageData.status || device.status,
                lastUpdate: new Date().toISOString()
              }
            }
            return device
          })
        )
      }
    }

    return () => {
    }
  }, [mqttTopic])


  return (
    <div className="w-full h-full bg-white rounded-lg border border-gray-200 p-2 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <h3 className="text-sm font-semibold text-gray-900 truncate">{title}</h3>
        <div className="flex items-center space-x-1 flex-shrink-0">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-500">Live</span>
        </div>
      </div>
      
      <div className="flex-1 relative min-h-0 overflow-hidden" style={{ minHeight: '120px' }}>
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ width: '100%', height: '100%', borderRadius: '8px' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapUpdater devices={safeDevices} />
          
          {safeDevices.map((device) => (
            <Marker
              key={device.id}
              position={[device.lat, device.lng]}
              icon={createDeviceIcon(device.type, device.status)}
            >
              <Popup>
                <div className="p-2">
                  <h4 className="font-semibold text-gray-900 mb-2">{device.name}</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="capitalize">{device.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`capitalize ${
                        device.status === 'online' ? 'text-red-600' :
                        device.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {device.status}
                      </span>
                    </div>
                    {device.data.temperature && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Temperature:</span>
                        <span>{device.data.temperature}°C</span>
                      </div>
                    )}
                    {device.data.humidity && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Humidity:</span>
                        <span>{device.data.humidity}%</span>
                      </div>
                    )}
                    {device.data.power && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Power:</span>
                        <span>{device.data.power}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Devices: {safeDevices.length}
        </div>
        <div className="flex space-x-2">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-xs text-gray-500">Online</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <span className="text-xs text-gray-500">Warning</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-xs text-gray-500">Offline</span>
          </div>
        </div>
      </div>
      
      {mqttTopic && (
        <div className="mt-2 text-xs text-gray-400 text-center">
          Topic: {mqttTopic}
        </div>
      )}
    </div>
  )
}
