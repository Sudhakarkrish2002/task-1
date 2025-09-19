import React, { useState, useCallback, useRef, useEffect } from 'react'
import ProfessionalGrid from './ProfessionalGrid'
import ProfessionalWidgetPalette from './ProfessionalWidgetPalette'
import { generateWidgetId } from '../../lib/gridUtils'
import { GaugeWidget } from '../widgets/gauge-widget'
import { ChartWidget } from '../widgets/chart-widget'
import { ToggleWidget } from '../widgets/toggle-widget'
import { SliderWidget } from '../widgets/slider-widget'
import { MapWidget } from '../widgets/map-widget'
import { NotificationWidget } from '../widgets/notification-widget'
import { SimpleSensorWidget } from '../widgets/simple-sensor-widget'
import { Model3DWidget } from '../widgets/model3d-widget'

// Mobile and tablet detection hook
const useDeviceType = () => {
  const [deviceType, setDeviceType] = useState('desktop')
  
  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth
      if (width <= 768) {
        setDeviceType('mobile')
      } else if (width <= 1024) {
        setDeviceType('tablet')
      } else {
        setDeviceType('desktop')
      }
    }
    
    checkDeviceType()
    window.addEventListener('resize', checkDeviceType)
    return () => window.removeEventListener('resize', checkDeviceType)
  }, [])
  
  return {
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop',
    deviceType
  }
}

/**
 * Professional Grid Manager
 * Main component that manages the professional grid system
 */
export const ProfessionalGridManager = ({
  initialWidgets = [],
  onWidgetsChange,
  isPreviewMode = false,
  className = '',
  style = {}
}) => {
  const [widgets, setWidgets] = useState(initialWidgets)
  const [selectedWidget, setSelectedWidget] = useState(null)
  const [showWidgetSettings, setShowWidgetSettings] = useState(false)
  const [widgetSettings, setWidgetSettings] = useState(null)
  const [showMobilePalette, setShowMobilePalette] = useState(false)
  const { isMobile, isTablet, isDesktop, deviceType } = useDeviceType()
  
  // Debug mobile detection
  useEffect(() => {
    console.log('Device type detected:', deviceType, 'isMobile:', isMobile, 'window width:', window.innerWidth)
  }, [deviceType, isMobile])

  // Get widget renderer - MUST be defined before any useEffect that uses it
  const getWidgetRenderer = useCallback((widgetType) => {
    return (widget) => {
      // Return the actual React widget component
      const commonProps = {
        widgetId: widget.id,
        title: widget.title,
        panelId: 'default',
        autoGenerate: true
      }

      switch (widgetType) {
        case 'gauge':
          return (
            <GaugeWidget
              {...commonProps}
              min={widget.minValue || 0}
              max={widget.maxValue || 100}
              unit={widget.data?.unit || '%'}
              color="#ef4444"
            />
          )
        case 'chart':
          return (
            <ChartWidget
              {...commonProps}
              chartType="bar"
              color="#ef4444"
            />
          )
        case 'toggle':
          return (
            <ToggleWidget
              {...commonProps}
            />
          )
        case 'slider':
          return (
            <SliderWidget
              {...commonProps}
              min={widget.minValue || 0}
              max={widget.maxValue || 100}
              unit={widget.data?.unit || ''}
              color="#ef4444"
            />
          )
        case 'map':
          return (
            <MapWidget
              {...commonProps}
            />
          )
        case 'notification':
          return (
            <NotificationWidget
              {...commonProps}
            />
          )
        case 'sensor-tile':
          return (
            <SimpleSensorWidget
              {...commonProps}
            />
          )
        case '3d-model':
          return (
            <Model3DWidget
              {...commonProps}
            />
          )
        default:
          return (
            <div className="widget-placeholder">
              <div className="widget-header">
                <h4>{widget.title}</h4>
                <span className="widget-type">{widget.type}</span>
              </div>
              <div className="widget-content">
                <div className="widget-preview">
                  <div className="placeholder-text">Unknown widget type</div>
                </div>
              </div>
            </div>
          )
      }
    }
  }, [])

  // Add event listener for save functionality
  useEffect(() => {
    const handleSaveEvent = (event) => {
      console.log('ProfessionalGridManager: Save event received')
      const { callback } = event.detail
      if (callback && typeof callback === 'function') {
        console.log('ProfessionalGridManager: Current widgets before conversion:', widgets)
        
        // Convert widgets to the format expected by CreatePanel
        const convertedWidgets = widgets.map(widget => {
          // Ensure widget has the correct format for saving
          return {
            i: widget.id, // Use 'i' as the key for compatibility with CreatePanel
            id: widget.id,
            type: widget.type,
            x: widget.x,
            y: widget.y,
            w: widget.w,
            h: widget.h,
            title: widget.title || `${widget.type.charAt(0).toUpperCase() + widget.type.slice(1)}`,
            dataType: widget.dataType || 'int',
            entryType: widget.entryType || 'automatic',
            minValue: widget.minValue || 0,
            maxValue: widget.maxValue || 100,
            dataChannelId: widget.dataChannelId || 0,
            ...widget // Include any additional properties
          }
        })
        
        // Prepare the data to be saved
        const saveData = {
          widgets: convertedWidgets,
          layouts: { lg: convertedWidgets }, // Use converted widgets as layout
          stats: {
            totalWidgets: convertedWidgets.length,
            gridUtilization: convertedWidgets.length / 20 // Assuming 20 is max capacity
          }
        }
        
        console.log('ProfessionalGridManager: Sending save data:', saveData)
        console.log('ProfessionalGridManager: Number of widgets being saved:', convertedWidgets.length)
        callback(saveData)
      } else {
        console.error('ProfessionalGridManager: Invalid callback provided in save event')
      }
    }

    window.addEventListener('gridManagerSave', handleSaveEvent)
    
    return () => {
      window.removeEventListener('gridManagerSave', handleSaveEvent)
    }
  }, [widgets])

  // Sync widgets when initialWidgets change
  useEffect(() => {
    // Ensure all widgets have the proper render function
    const widgetsWithRender = initialWidgets.map(widget => ({
      ...widget,
      render: getWidgetRenderer(widget.type)
    }))
    setWidgets(widgetsWithRender)
  }, [initialWidgets, getWidgetRenderer])

  // Widget size configuration - responsive
  const getWidgetSize = useCallback((widgetType) => {
    if (isMobile) {
      // Mobile-optimized sizes (full width for most widgets)
      const mobileSizes = {
        'gauge': { w: 12, h: 3 },
        'chart': { w: 12, h: 4 },
        'toggle': { w: 6, h: 2 },
        'slider': { w: 12, h: 2 },
        'map': { w: 12, h: 5 },
        'notification': { w: 12, h: 4 },
        'sensor-tile': { w: 6, h: 3 },
        '3d-model': { w: 12, h: 5 }
      }
      return mobileSizes[widgetType] || { w: 12, h: 3 }
    } else if (isTablet) {
      // Tablet-optimized sizes (medium sizes)
      const tabletSizes = {
        'gauge': { w: 4, h: 3 },
        'chart': { w: 6, h: 4 },
        'toggle': { w: 3, h: 2 },
        'slider': { w: 4, h: 2 },
        'map': { w: 8, h: 5 },
        'notification': { w: 4, h: 4 },
        'sensor-tile': { w: 4, h: 3 },
        '3d-model': { w: 6, h: 5 }
      }
      return tabletSizes[widgetType] || { w: 4, h: 3 }
    } else {
      // Desktop sizes
      const sizes = {
        'gauge': { w: 3, h: 3 },
        'chart': { w: 4, h: 4 },
        'toggle': { w: 3, h: 3 },
        'slider': { w: 3, h: 2 },
        'map': { w: 6, h: 5 },
        'notification': { w: 3, h: 4 },
        'sensor-tile': { w: 3, h: 3 },
        '3d-model': { w: 4, h: 5 }
      }
      return sizes[widgetType] || { w: 3, h: 3 }
    }
  }, [isMobile, isTablet])

  // Find next available position
  const findAvailablePosition = useCallback((w, h) => {
    for (let y = 0; y < 20; y++) {
      for (let x = 0; x <= 12 - w; x++) {
        const isAvailable = !widgets.some(widget => {
          const widgetRight = widget.x + widget.w
          const widgetBottom = widget.y + widget.h
          const newRight = x + w
          const newBottom = y + h
          
          return !(x >= widgetRight || newRight <= widget.x || y >= widgetBottom || newBottom <= widget.y)
        })
        
        if (isAvailable) {
          return { x, y }
        }
      }
    }
    return { x: 0, y: 20 }
  }, [widgets])

  // Handle widget add
  const handleWidgetAdd = useCallback((widgetType, position = null) => {
    const size = getWidgetSize(widgetType)
    const finalPosition = position || findAvailablePosition(size.w, size.h)
    
    const newWidget = {
      id: generateWidgetId(),
      i: generateWidgetId(), // Add 'i' property for compatibility with CreatePanel
      type: widgetType,
      x: finalPosition.x,
      y: finalPosition.y,
      w: size.w,
      h: size.h,
      title: `${widgetType.charAt(0).toUpperCase() + widgetType.slice(1)}`,
      dataType: 'int',
      entryType: 'automatic',
      minValue: 0,
      maxValue: 100,
      dataChannelId: 0,
      data: getDefaultWidgetData(widgetType),
      render: getWidgetRenderer(widgetType)
    }
    
    const updatedWidgets = [...widgets, newWidget]
    setWidgets(updatedWidgets)
    
    if (onWidgetsChange) {
      onWidgetsChange(updatedWidgets)
    }
  }, [widgets, getWidgetSize, findAvailablePosition, onWidgetsChange])

  // Handle widget delete
  const handleWidgetDelete = useCallback((widgetId) => {
    const updatedWidgets = widgets.filter(w => w.id !== widgetId)
    setWidgets(updatedWidgets)
    
    if (onWidgetsChange) {
      onWidgetsChange(updatedWidgets)
    }
  }, [widgets, onWidgetsChange])

  // Handle widget copy
  const handleWidgetCopy = useCallback((widgetId) => {
    const widgetToCopy = widgets.find(w => w.id === widgetId)
    if (!widgetToCopy) return
    
    const newPosition = findAvailablePosition(widgetToCopy.w, widgetToCopy.h)
    const newId = generateWidgetId()
    
    const copiedWidget = {
      ...widgetToCopy,
      id: newId,
      i: newId, // Ensure 'i' property is also updated
      x: newPosition.x,
      y: newPosition.y,
      title: `${widgetToCopy.title} (Copy)`
    }
    
    const updatedWidgets = [...widgets, copiedWidget]
    setWidgets(updatedWidgets)
    
    if (onWidgetsChange) {
      onWidgetsChange(updatedWidgets)
    }
  }, [widgets, findAvailablePosition, onWidgetsChange])

  // Handle widget update
  const handleWidgetUpdate = useCallback((widgetId, updates) => {
    const updatedWidgets = widgets.map(w => 
      w.id === widgetId ? { ...w, ...updates } : w
    )
    setWidgets(updatedWidgets)
    
    if (onWidgetsChange) {
      onWidgetsChange(updatedWidgets)
    }
  }, [widgets, onWidgetsChange])

  // Handle widget settings
  const handleWidgetSettings = useCallback((widget) => {
    setWidgetSettings({
      id: widget.id,
      title: widget.title || `${widget.type.charAt(0).toUpperCase() + widget.type.slice(1)}`,
      dataType: widget.dataType || 'int',
      entryType: widget.entryType || 'automatic',
      minValue: widget.minValue || 0,
      maxValue: widget.maxValue || 100,
      dataChannelId: widget.dataChannelId || 0,
      customDataChannelId: widget.customDataChannelId || '',
      ...widget // Include any additional properties
    })
    setShowWidgetSettings(true)
  }, [])

  // Handle widget settings save
  const handleWidgetSettingsSave = useCallback((settings) => {
    if (widgetSettings) {
      handleWidgetUpdate(widgetSettings.id, settings)
      setShowWidgetSettings(false)
      setWidgetSettings(null)
    }
  }, [widgetSettings, handleWidgetUpdate])

  // Get default widget data
  const getDefaultWidgetData = useCallback((widgetType) => {
    const defaults = {
      'gauge': { value: 50, min: 0, max: 100, unit: '%' },
      'chart': { data: [], type: 'line' },
      'toggle': { value: false, label: 'Toggle' },
      'slider': { value: 50, min: 0, max: 100 },
      'map': { center: [37.7749, -122.4194], zoom: 10 },
      'notification': { messages: [] },
      'sensor-tile': { value: 25, unit: '°C', label: 'Temperature' },
      '3d-model': { model: 'cube', color: '#3b82f6' }
    }
    return defaults[widgetType] || {}
  }, [])


  return (
    <div className={`professional-grid-manager ${className}`} style={style}>
      <div className={`grid-manager-layout ${isMobile ? 'mobile-layout' : isTablet ? 'tablet-layout' : 'desktop-layout'}`}>
        {/* Widget Palette */}
        {!isPreviewMode && (
          <>
            {/* Desktop & Tablet Palette */}
            {!isMobile && (
              <div className={`palette-container ${isTablet ? 'tablet-palette' : 'desktop-palette'}`}>
                <ProfessionalWidgetPalette
                  onWidgetClick={handleWidgetAdd}
                  isTablet={isTablet}
                />
              </div>
            )}
            
            {/* Mobile Palette */}
            {isMobile && (
              <>
                {/* Mobile Palette Toggle Button */}
                <button
                  onClick={() => {
                    console.log('Mobile add button clicked, current state:', showMobilePalette)
                    setShowMobilePalette(!showMobilePalette)
                  }}
                  className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white p-5 rounded-full shadow-2xl transition-all duration-200 touch-target border-2 border-white"
                  aria-label="Add widget"
                  style={{
                    width: '64px',
                    height: '64px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
                
                {/* Mobile Palette Overlay */}
                {showMobilePalette && (
                  <div 
                    className="fixed inset-0 bg-black bg-opacity-60 z-50" 
                    onClick={() => {
                      console.log('Closing mobile palette')
                      setShowMobilePalette(false)
                    }}
                  >
                    <div 
                      className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[80vh] overflow-hidden animate-slide-up" 
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Handle bar */}
                      <div className="flex justify-center pt-3 pb-2">
                        <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
                      </div>
                      
                      <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-bold text-gray-900">Add Widget</h3>
                          <button
                            onClick={() => {
                              console.log('Closing mobile palette via X button')
                              setShowMobilePalette(false)
                            }}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors touch-target rounded-full hover:bg-gray-100"
                          >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Choose a widget to add to your dashboard</p>
                      </div>
                      
                      <div className="p-4 overflow-y-auto max-h-[calc(80vh-120px)]">
                        <ProfessionalWidgetPalette
                          onWidgetClick={(widgetType) => {
                            console.log('Widget clicked:', widgetType)
                            handleWidgetAdd(widgetType)
                            setShowMobilePalette(false)
                          }}
                          isMobile={true}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Main Grid */}
        <div className={`grid-container ${isMobile ? 'mobile-grid' : isTablet ? 'tablet-grid' : 'desktop-grid'}`}>
          <ProfessionalGrid
            widgets={widgets}
            onWidgetAdd={handleWidgetAdd}
            onWidgetDelete={handleWidgetDelete}
            onWidgetCopy={handleWidgetCopy}
            onWidgetUpdate={handleWidgetUpdate}
            onWidgetSettings={handleWidgetSettings}
            isPreviewMode={isPreviewMode}
            isMobile={isMobile}
            isTablet={isTablet}
          />
        </div>
        
        {/* Fallback Mobile Add Button - Always visible on small screens */}
        {!isPreviewMode && (
          <button
            onClick={() => {
              console.log('Fallback mobile add button clicked')
              setShowMobilePalette(!showMobilePalette)
            }}
            className="mobile-add-button md:hidden"
            aria-label="Add widget"
          >
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        )}
      </div>

      {/* Enhanced Widget Settings Modal */}
      {showWidgetSettings && widgetSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{zIndex: 99999}}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto" style={{zIndex: 100000}}>
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Widget Settings</h3>
                <button
                  onClick={() => setShowWidgetSettings(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Settings Form */}
              <div className="space-y-4">
                {/* 1. Widget Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Widget Title</label>
                  <input
                    type="text"
                    value={widgetSettings.title || ''}
                    onChange={(e) => setWidgetSettings({ ...widgetSettings, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter widget title"
                  />
                </div>

                {/* 2. Data Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data Type</label>
                  <select
                    value={widgetSettings.dataType || 'int'}
                    onChange={(e) => setWidgetSettings({ ...widgetSettings, dataType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="int">Integer (int)</option>
                    <option value="string">String (string)</option>
                    <option value="float">Floating Point (float)</option>
                  </select>
                </div>

                {/* 3. Entry Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Entry Type</label>
                  <select
                    value={widgetSettings.entryType || 'automatic'}
                    onChange={(e) => setWidgetSettings({ ...widgetSettings, entryType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="automatic">Automatic</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>

                {/* 4. & 5. Minimum & Maximum Values */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Value</label>
                    <input
                      type="number"
                      value={widgetSettings.minValue || 0}
                      onChange={(e) => setWidgetSettings({ ...widgetSettings, minValue: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Value</label>
                    <input
                      type="number"
                      value={widgetSettings.maxValue || 100}
                      onChange={(e) => setWidgetSettings({ ...widgetSettings, maxValue: parseFloat(e.target.value) || 100 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="100"
                    />
                  </div>
                </div>

                {/* 6. Data Channel ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data Channel ID</label>
                  <div className="space-y-2">
                    <select
                      value={widgetSettings.dataChannelId || 0}
                      onChange={(e) => setWidgetSettings({ ...widgetSettings, dataChannelId: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={0}>Channel 0</option>
                      <option value={1}>Channel 1</option>
                      <option value={2}>Channel 2</option>
                      <option value={3}>Channel 3</option>
                      <option value={4}>Channel 4</option>
                      <option value={5}>Channel 5</option>
                      <option value={6}>Channel 6</option>
                      <option value={-1}>Manual Entry</option>
                    </select>
                    {widgetSettings.dataChannelId === -1 && (
                      <input
                        type="number"
                        value={widgetSettings.customDataChannelId || ''}
                        onChange={(e) => setWidgetSettings({ ...widgetSettings, customDataChannelId: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter custom channel ID"
                        min="0"
                      />
                    )}
                  </div>
                </div>
              </div>
              
              {/* Modal Footer */}
              <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowWidgetSettings(false)}
                  className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleWidgetSettingsSave(widgetSettings)}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  Save Configuration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProfessionalGridManager
