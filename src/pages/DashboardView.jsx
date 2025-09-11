import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Edit, 
  Share2,
  BarChart3,
  Settings
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { GaugeWidget } from '../components/widgets/gauge-widget'
import { SimpleSensorWidget } from '../components/widgets/simple-sensor-widget'
import { ToggleWidget } from '../components/widgets/toggle-widget'
import { ChartWidget } from '../components/widgets/chart-widget'
import { SliderWidget } from '../components/widgets/slider-widget'
import { MapWidget } from '../components/widgets/map-widget'
import { Model3DWidget } from '../components/widgets/model3d-widget'
import { NotificationWidget } from '../components/widgets/notification-widget'
import { EnhancedGridLayout } from '../components/grid/EnhancedGridLayout'
import { usePanelStore } from '../stores/usePanelStore'
import { fixWidgetMinMaxValues, fixLayoutMinMaxValues } from '../lib/gridUtils'
import PanelSharing from '../components/panels/PanelSharing'
import randomDataGenerator from '../services/randomDataGenerator'

export default function DashboardView() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { panels, currentPanel, setCurrentPanel } = usePanelStore()
  const [showSharingModal, setShowSharingModal] = useState(false)
  const [widgetData, setWidgetData] = useState({})
  const [showWidgetSettings, setShowWidgetSettings] = useState(false)
  const [selectedWidget, setSelectedWidget] = useState(null)

  // Get panel ID from URL
  const panelId = searchParams.get('panel')

  // Generate random data for widgets in the current panel
  const generateWidgetData = useCallback(() => {
    if (!currentPanel || !currentPanel.widgets) return

    const newWidgetData = {}
    currentPanel.widgets.forEach(widget => {
      switch (widget.type) {
        case 'gauge':
          newWidgetData[widget.i] = {
            value: Math.random() * 100,
            max: widget.max || 100,
            min: widget.min || 0
          }
          break
        case 'chart':
          newWidgetData[widget.i] = {
            value: Math.random() * 100,
            timestamp: new Date().toISOString()
          }
          break
        case 'toggle':
          newWidgetData[widget.i] = {
            status: Math.random() > 0.5
          }
          break
        case 'sensor-tile':
          newWidgetData[widget.i] = {
            value: (Math.random() * 50 + 10).toFixed(1),
            unit: widget.unit || '°C'
          }
          break
        case 'slider':
          newWidgetData[widget.i] = {
            value: Math.random() * (widget.max || 100)
          }
          break
        default:
          newWidgetData[widget.i] = {
            value: Math.random() * 100
          }
      }
    })
    setWidgetData(newWidgetData)
  }, [currentPanel])

  // Load panel data when component mounts or panelId changes
  useEffect(() => {
    if (panelId) {
      const panel = panels.find(p => p.id === panelId)
      if (panel) {
        setCurrentPanel(panel)
      } else {
        // Panel not found, redirect to panels list
        navigate('/')
      }
    } else {
      // No panel ID, redirect to panels list
      navigate('/')
    }
  }, [panelId, panels, navigate, setCurrentPanel])

  // Generate initial widget data and set up interval for updates
  useEffect(() => {
    if (currentPanel && currentPanel.widgets) {
      generateWidgetData() // Generate initial data
      
      // Set up interval to update widget data every 3 seconds
      const interval = setInterval(() => {
        generateWidgetData()
      }, 3000)

      return () => clearInterval(interval)
    }
  }, [currentPanel, generateWidgetData])

  // Handle widget settings
  const handleWidgetSettings = useCallback((widget) => {
    setSelectedWidget(widget)
    setShowWidgetSettings(true)
  }, [])

  // Memoized widget renderer for performance
  const renderWidget = useCallback((widget) => {
    const data = widgetData[widget.i] || {}
    
    switch (widget.type) {
      case 'gauge':
        return (
          <div className="w-full h-full flex flex-col p-2 relative">
            <div className="flex items-center justify-between mb-2 flex-shrink-0">
              <h3 className="text-sm font-semibold text-gray-900 truncate">{widget.title || 'Gauge'}</h3>
              <div className="flex items-center space-x-1 flex-shrink-0">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500">Live</span>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center min-h-0">
              <GaugeWidget
                value={data.value || 50}
                max={data.max || widget.max || 100}
                min={data.min || widget.min || 0}
                label={widget.label || ''}
                color={widget.color || 'primary'}
              />
            </div>
            {/* Settings Icon */}
            <button
              onClick={() => handleWidgetSettings(widget)}
              className="absolute top-2 left-2 p-1 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full shadow-sm transition-all duration-200 hover:shadow-md"
              title="Widget Settings"
            >
              <Settings className="w-3 h-3 text-gray-600 hover:text-gray-800" />
            </button>
          </div>
        )
      case 'chart':
        return (
          <ChartWidget
            widgetId={widget.i}
            mqttTopic={widget.mqttTopic}
            title={widget.title || 'Chart'}
            chartType={widget.chartType || 'line'}
            color={widget.color || '#3b82f6'}
            size="small"
          />
        )
      case 'map':
        return (
          <MapWidget
            widgetId={widget.i}
            mqttTopic={widget.mqttTopic}
            title={widget.title || 'Map'}
            size="small"
          />
        )
      case 'notification':
        return (
          <NotificationWidget
            widgetId={widget.i}
            mqttTopic={widget.mqttTopic}
            title={widget.title || 'Notifications'}
            size="small"
          />
        )
      case 'toggle':
        return (
          <div className="w-full h-full flex flex-col p-2 relative">
            <div className="flex items-center justify-between mb-2 flex-shrink-0">
              <h3 className="text-sm font-semibold text-gray-900 truncate">{widget.title || 'Toggle'}</h3>
              <div className="flex items-center space-x-1 flex-shrink-0">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500">Live</span>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center min-h-0">
              <ToggleWidget
                name=""
                status={data.status !== undefined ? data.status : (widget.status || false)}
                location={widget.location || ''}
              />
            </div>
            {/* Settings Icon */}
            <button
              onClick={() => handleWidgetSettings(widget)}
              className="absolute top-2 left-2 p-1 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full shadow-sm transition-all duration-200 hover:shadow-md"
              title="Widget Settings"
            >
              <Settings className="w-3 h-3 text-gray-600 hover:text-gray-800" />
            </button>
          </div>
        )
      case 'sensor-tile':
        return (
          <div className="w-full h-full relative">
            <SimpleSensorWidget
              value={data.value || widget.value || '0'}
              title={widget.title || 'Sensor'}
              unit={data.unit || widget.unit || ''}
              size="small"
            />
            {/* Settings Icon */}
            <button
              onClick={() => handleWidgetSettings(widget)}
              className="absolute top-2 left-2 p-1 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full shadow-sm transition-all duration-200 hover:shadow-md"
              title="Widget Settings"
            >
              <Settings className="w-3 h-3 text-gray-600 hover:text-gray-800" />
            </button>
          </div>
        )
      case 'slider':
        return (
          <div className="w-full h-full relative">
            <SliderWidget
              widgetId={widget.i}
              mqttTopic={widget.mqttTopic}
              title={widget.title || 'Slider'}
              value={data.value || widget.value || 50}
              min={widget.min || 0}
              max={widget.max || 100}
              color={widget.color || '#3b82f6'}
              size="small"
            />
            {/* Settings Icon */}
            <button
              onClick={() => handleWidgetSettings(widget)}
              className="absolute top-2 left-2 p-1 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full shadow-sm transition-all duration-200 hover:shadow-md"
              title="Widget Settings"
            >
              <Settings className="w-3 h-3 text-gray-600 hover:text-gray-800" />
            </button>
          </div>
        )
      case '3d-model':
        return (
          <div className="w-full h-full relative">
            <Model3DWidget
              widgetId={widget.i}
              mqttTopic={widget.mqttTopic}
              title={widget.title || '3D Model'}
              modelType={widget.modelType || 'cube'}
              color={widget.color || '#3b82f6'}
              size="small"
            />
            {/* Settings Icon */}
            <button
              onClick={() => handleWidgetSettings(widget)}
              className="absolute top-2 left-2 p-1 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full shadow-sm transition-all duration-200 hover:shadow-md"
              title="Widget Settings"
            >
              <Settings className="w-3 h-3 text-gray-600 hover:text-gray-800" />
            </button>
          </div>
        )
      default:
        return (
          <div className="w-full h-full bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center relative">
            <span className="text-gray-500 text-sm">{widget.type || 'Widget'}</span>
            {/* Settings Icon */}
            <button
              onClick={() => handleWidgetSettings(widget)}
              className="absolute top-2 left-2 p-1 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full shadow-sm transition-all duration-200 hover:shadow-md"
              title="Widget Settings"
            >
              <Settings className="w-3 h-3 text-gray-600 hover:text-gray-800" />
            </button>
          </div>
        )
    }
  }, [widgetData, handleWidgetSettings])

  // Memoized panel data to prevent unnecessary re-renders
  const memoizedPanel = useMemo(() => {
    return currentPanel
  }, [currentPanel?.id, currentPanel?.updatedAt, currentPanel?.widgets?.length])

  // Handle edit panel
  const handleEditPanel = useCallback(() => {
    navigate(`/create?edit=${panelId}`)
  }, [navigate, panelId])

  // Show loading state
  if (!currentPanel) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Dashboard...</h2>
          <p className="text-gray-600">Please wait while we load your panel</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{memoizedPanel.name}</h1>
              <p className="text-sm text-gray-600 mt-1">
                {memoizedPanel.widgets?.length || 0} widgets • 
                Created {new Date(memoizedPanel.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => setShowSharingModal(true)}
              variant="outline"
              size="sm"
              className="text-blue-600 border-blue-300 hover:bg-blue-50"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Panel
            </Button>
            <Button
              onClick={handleEditPanel}
              variant="outline"
              size="sm"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Panel
            </Button>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="flex-1 overflow-auto p-6">
        {/* Panel Widgets */}
        {memoizedPanel.widgets && memoizedPanel.widgets.length > 0 ? (
          <div className="min-h-full">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Panel Widgets</h2>
            <EnhancedGridLayout
              widgets={fixWidgetMinMaxValues(memoizedPanel.widgets)}
              layouts={fixLayoutMinMaxValues(memoizedPanel.layout || { lg: memoizedPanel.widgets })}
              renderWidget={renderWidget}
              isPreviewMode={true}
              showGridBackground={false}
              showStatusBar={false}
              className="dashboard-view"
              style={{ minHeight: '100%', height: 'auto' }}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No widgets added yet</h3>
              <p className="text-gray-600 mb-4">This panel doesn't have any widgets configured</p>
              <Button
                onClick={handleEditPanel}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                <Edit className="w-4 h-4 mr-2" />
                Add Widgets
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Panel Sharing Modal */}
      <PanelSharing 
        isOpen={showSharingModal}
        onClose={() => setShowSharingModal(false)}
        panelName={memoizedPanel?.name || "Dashboard"}
        panelId={memoizedPanel?.id}
      />

      {/* Widget Settings Modal */}
      {showWidgetSettings && selectedWidget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Widget Settings</h3>
                <button
                  onClick={() => setShowWidgetSettings(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Widget Type</label>
                  <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-600">
                    {selectedWidget.type || 'Unknown'}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Widget Title</label>
                  <input
                    type="text"
                    value={selectedWidget.title || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter widget title"
                    readOnly
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Widget ID</label>
                  <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-600 font-mono">
                    {selectedWidget.i || selectedWidget.id || 'N/A'}
                  </div>
                </div>
                
                {selectedWidget.type === 'gauge' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Min Value</label>
                      <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-600">
                        {selectedWidget.min || 0}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Max Value</label>
                      <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-600">
                        {selectedWidget.max || 100}
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedWidget.type === 'slider' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Min Value</label>
                      <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-600">
                        {selectedWidget.min || 0}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Max Value</label>
                      <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-600">
                        {selectedWidget.max || 100}
                      </div>
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">MQTT Topic</label>
                  <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-600">
                    {selectedWidget.mqttTopic || 'Not configured'}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowWidgetSettings(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    // Navigate to edit mode for this specific widget
                    navigate(`/create?edit=${memoizedPanel.id}`)
                    setShowWidgetSettings(false)
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Edit Widget
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
