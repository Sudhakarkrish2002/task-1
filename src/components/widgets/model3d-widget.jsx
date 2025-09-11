import React, { useState, useEffect } from 'react'
import { Box, RotateCcw, RotateCw, ZoomIn, ZoomOut } from 'lucide-react'

export const Model3DWidget = ({ 
  widgetId,
  mqttTopic,
  title = '3D Model',
  modelType = 'cube',
  rotation = { x: 0, y: 0, z: 0 },
  scale = 1,
  color = '#3b82f6',
  size = 'medium'
}) => {
  const [currentRotation, setCurrentRotation] = useState(rotation)
  const [currentScale, setCurrentScale] = useState(scale)
  const [isRotating, setIsRotating] = useState(false)

  // Size configurations
  const sizeConfig = {
    small: { width: 200, height: 150 },
    medium: { width: 300, height: 200 },
    large: { width: 400, height: 250 }
  }

  const { width, height } = sizeConfig[size] || sizeConfig.medium

  // Auto-rotation effect
  useEffect(() => {
    if (!isRotating) return

    const interval = setInterval(() => {
      setCurrentRotation(prev => ({
        x: prev.x,
        y: prev.y + 1,
        z: prev.z
      }))
    }, 50)

    return () => clearInterval(interval)
  }, [isRotating])

  // For now, we'll skip MQTT integration

  // Handle rotation control
  const handleRotation = (axis, direction) => {
    const newRotation = {
      ...currentRotation,
      [axis]: currentRotation[axis] + (direction * 15)
    }
    setCurrentRotation(newRotation)
    
    // MQTT integration removed
  }

  // Handle scale control
  const handleScale = (direction) => {
    const newScale = Math.max(0.5, Math.min(2, currentScale + (direction * 0.1)))
    setCurrentScale(newScale)
    
    // MQTT integration removed
  }

  // Toggle auto-rotation
  const toggleRotation = () => {
    const newRotatingState = !isRotating
    setIsRotating(newRotatingState)
    
    // MQTT integration removed
  }

  // Render 3D model based on type
  const renderModel = () => {
    const transform = `rotateX(${currentRotation.x}deg) rotateY(${currentRotation.y}deg) rotateZ(${currentRotation.z}deg) scale(${currentScale})`
    
    switch (modelType) {
      case 'cube':
        return (
          <div 
            className="w-20 h-20 relative"
            style={{ 
              transform,
              transformStyle: 'preserve-3d',
              transition: isRotating ? 'none' : 'transform 0.3s ease'
            }}
          >
            {/* Cube faces */}
            {[
              { transform: 'rotateY(0deg) translateZ(40px)', color: color },
              { transform: 'rotateY(90deg) translateZ(40px)', color: color + '80' },
              { transform: 'rotateY(180deg) translateZ(40px)', color: color + '60' },
              { transform: 'rotateY(-90deg) translateZ(40px)', color: color + '40' },
              { transform: 'rotateX(90deg) translateZ(40px)', color: color + '90' },
              { transform: 'rotateX(-90deg) translateZ(40px)', color: color + '70' }
            ].map((face, index) => (
              <div
                key={index}
                className="absolute w-20 h-20 border border-gray-300"
                style={{
                  backgroundColor: face.color,
                  transform: face.transform
                }}
              />
            ))}
          </div>
        )
      
      case 'sphere':
        return (
          <div 
            className="w-20 h-20 rounded-full border-2 border-gray-300"
            style={{ 
              backgroundColor: color + '40',
              transform,
              transition: isRotating ? 'none' : 'transform 0.3s ease'
            }}
          />
        )
      
      case 'pyramid':
        return (
          <div 
            className="relative"
            style={{ 
              transform,
              transition: isRotating ? 'none' : 'transform 0.3s ease'
            }}
          >
            <div 
              className="w-0 h-0 border-l-[40px] border-r-[40px] border-b-[60px] border-l-transparent border-r-transparent"
              style={{ borderBottomColor: color }}
            />
          </div>
        )
      
      default:
        return (
          <div 
            className="w-20 h-20 border-2 border-gray-300 rounded"
            style={{ 
              backgroundColor: color + '40',
              transform,
              transition: isRotating ? 'none' : 'transform 0.3s ease'
            }}
          />
        )
    }
  }

  return (
    <div className="w-full h-full bg-white rounded-lg border border-gray-200 p-2 flex flex-col">
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <h3 className="text-sm font-semibold text-gray-900 truncate">{title}</h3>
        <div className="flex items-center space-x-1 flex-shrink-0">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-500">Live</span>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center min-h-0">
        {/* 3D Model Display */}
        <div className="flex items-center justify-center mb-3" style={{ height: '80px' }}>
          {renderModel()}
        </div>
        
        {/* Control Panel */}
        <div className="space-y-2 w-full max-w-full px-2">
          {/* Rotation Controls */}
          <div className="flex justify-center space-x-2">
            <button
              onClick={() => handleRotation('y', -1)}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              title="Rotate Left"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={toggleRotation}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                isRotating 
                  ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              {isRotating ? 'Stop' : 'Auto'}
            </button>
            <button
              onClick={() => handleRotation('y', 1)}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              title="Rotate Right"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
          
          {/* Scale Controls */}
          <div className="flex justify-center space-x-2">
            <button
              onClick={() => handleScale(-1)}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="px-3 py-2 text-sm font-medium text-gray-700">
              {Math.round(currentScale * 100)}%
            </span>
            <button
              onClick={() => handleScale(1)}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <div className="text-sm text-gray-600">
          Type: {modelType.charAt(0).toUpperCase() + modelType.slice(1)}
        </div>
        {mqttTopic && (
          <div className="text-xs text-gray-400 mt-1">
            Topic: {mqttTopic}
          </div>
        )}
      </div>
    </div>
  )
}
