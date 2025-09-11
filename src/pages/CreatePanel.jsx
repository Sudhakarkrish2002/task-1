import { useState, useCallback, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { usePanelStore } from '../stores/usePanelStore'
import { useDeviceStore } from '../stores/useDeviceStore'
import { GaugeWidget } from '../components/widgets/gauge-widget'
import { ChartWidget } from '../components/widgets/chart-widget'
import { MapWidget } from '../components/widgets/map-widget'
import { NotificationWidget } from '../components/widgets/notification-widget'
import { ToggleWidget } from '../components/widgets/toggle-widget'
import { SimpleSensorWidget } from '../components/widgets/simple-sensor-widget'
import { SliderWidget } from '../components/widgets/slider-widget'
import { Model3DWidget } from '../components/widgets/model3d-widget'
import GridManager from '../components/grid/GridManager'

function CreatePanel() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [panelName, setPanelName] = useState('New Dashboard')
  const [mqttConnected, setMqttConnected] = useState(false)
  const [showWidgetSettings, setShowWidgetSettings] = useState(false)
  const [selectedWidget, setSelectedWidget] = useState(null)
  
  const { createPanel, updatePanel, currentPanel, setCurrentPanel, panels } = usePanelStore()
  const { devices, addDevice } = useDeviceStore()

  // Widget types available in the palette
  const widgetTypes = [
    { type: 'gauge', name: 'Gauge', icon: GaugeWidget, color: 'bg-blue-500', bgClass: 'bg-blue-100', textClass: 'text-blue-600', component: GaugeWidget },
    { type: 'chart', name: 'Chart', icon: ChartWidget, color: 'bg-red-500', bgClass: 'bg-red-100', textClass: 'text-red-600', component: ChartWidget },
    { type: 'toggle', name: 'Toggle', icon: ToggleWidget, color: 'bg-purple-500', bgClass: 'bg-purple-100', textClass: 'text-purple-600', component: ToggleWidget },
    { type: 'slider', name: 'Slider', icon: SliderWidget, color: 'bg-orange-500', bgClass: 'bg-orange-100', textClass: 'text-orange-600', component: SliderWidget },
    { type: 'map', name: 'Map', icon: MapWidget, color: 'bg-red-500', bgClass: 'bg-red-100', textClass: 'text-red-600', component: MapWidget },
    { type: '3d-model', name: '3D Model', icon: Model3DWidget, color: 'bg-indigo-500', bgClass: 'bg-indigo-100', textClass: 'text-indigo-600', component: Model3DWidget },
    { type: 'notification', name: 'Notification', icon: NotificationWidget, color: 'bg-yellow-500', bgClass: 'bg-yellow-100', textClass: 'text-yellow-600', component: NotificationWidget },
    { type: 'sensor-tile', name: 'Sensor Tile', icon: SimpleSensorWidget, color: 'bg-teal-500', bgClass: 'bg-teal-100', textClass: 'text-teal-600', component: SimpleSensorWidget }
  ]

  // For now, we'll simulate MQTT connection
  useEffect(() => {
    setMqttConnected(true)
  }, [])

  // Handle editing existing panel or creating new panel
  useEffect(() => {
    const editPanelId = searchParams.get('edit')
    
    if (editPanelId) {
      // Editing existing panel - load its data
      const panelToEdit = panels.find(p => p.id === editPanelId)
      if (panelToEdit) {
        setCurrentPanel(panelToEdit)
        setPanelName(panelToEdit.name || 'Unnamed Panel')
      } else {
        // Panel not found, redirect to panels list
        navigate('/')
      }
    } else {
      // Creating new panel - clear current panel
      setCurrentPanel(null)
      setPanelName('New Dashboard')
    }
  }, [searchParams, panels, setCurrentPanel, navigate])

  // Handle widget settings
  const handleWidgetSettings = useCallback((widget) => {
    setSelectedWidget(widget)
    setShowWidgetSettings(true)
  }, [])

  // Render widget function
  const renderWidget = useCallback((widget) => {
    switch (widget.type) {
      case 'gauge':
        return (
          <GaugeWidget
            value={widget.value || 50}
            max={widget.max || 100}
            label={widget.title || 'Gauge'}
            color={widget.color || 'primary'}
          />
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
            title={widget.title || 'Device Map'}
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
          <ToggleWidget
            name={widget.title || 'Toggle'}
            status={widget.status || false}
            location={widget.location || 'Device Location'}
          />
        )
      case 'sensor-tile':
        return (
          <SimpleSensorWidget
            value={widget.value || '0'}
            title={widget.title || 'Sensor'}
            unit={widget.unit || ''}
          />
        )
      case 'slider':
        return (
          <SliderWidget
            widgetId={widget.i}
            mqttTopic={widget.mqttTopic}
            title={widget.title || 'Slider Control'}
            value={widget.value || 50}
            min={widget.min || 0}
            max={widget.max || 100}
            color={widget.color || '#3b82f6'}
            size="small"
          />
        )
      case '3d-model':
        return (
          <Model3DWidget
            widgetId={widget.i}
            mqttTopic={widget.mqttTopic}
            title={widget.title || '3D Model'}
            modelType={widget.modelType || 'cube'}
            color={widget.color || '#3b82f6'}
            size="small"
          />
        )
      default:
        return (
          <div className="w-full h-full bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">{widget.type || 'Widget'}</span>
          </div>
        )
    }
  }, [handleWidgetSettings])

  // Handle save
  const handleSave = useCallback((data) => {
    const panelData = {
      name: panelName,
      widgets: data.widgets,
      layout: data.layouts,
      deviceCount: data.widgets.length,
      stats: data.stats
    }
    
    if (currentPanel) {
      updatePanel(currentPanel.id, panelData)
      alert('Panel updated successfully!')
      // Navigate to the updated dashboard
      navigate(`/dashboard?panel=${currentPanel.id}`)
    } else {
      const newPanel = createPanel(panelData)
      alert('Panel created successfully!')
      // Navigate to the new dashboard
      navigate(`/dashboard?panel=${newPanel.id}`)
    }
  }, [panelName, currentPanel, createPanel, updatePanel, navigate])

  // Handle export
  const handleExport = useCallback((data) => {
    // Export logic can be customized here
  }, [])

  // Handle import
  const handleImport = useCallback((data) => {
    // Import logic can be customized here
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* MQTT Status Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${mqttConnected ? 'bg-red-500' : 'bg-gray-500'}`}></div>
            <span className="text-sm text-gray-600">MQTT {mqttConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={panelName}
              onChange={(e) => setPanelName(e.target.value)}
              className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900"
            />
            <span className="text-sm text-gray-500">Panel Builder</span>
          </div>
        </div>
      </div>

      {/* Grid Manager */}
      <GridManager
        title={panelName}
        initialWidgets={currentPanel?.widgets || []}
        initialLayouts={currentPanel?.layout || {}}
        renderWidget={renderWidget}
        onSave={handleSave}
        onExport={handleExport}
        onImport={handleImport}
        onWidgetSettings={handleWidgetSettings}
        showPalette={true}
        showToolbar={true}
        widgetTypes={widgetTypes}
        className="h-[calc(100vh-60px)]"
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
                    onChange={(e) => {
                      // Update widget title in the current panel
                      if (currentPanel) {
                        const updatedWidgets = currentPanel.widgets.map(w => 
                          w.i === selectedWidget.i ? { ...w, title: e.target.value } : w
                        )
                        updatePanel(currentPanel.id, { widgets: updatedWidgets })
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter widget title"
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
                      <input
                        type="number"
                        value={selectedWidget.min || 0}
                        onChange={(e) => {
                          if (currentPanel) {
                            const updatedWidgets = currentPanel.widgets.map(w => 
                              w.i === selectedWidget.i ? { ...w, min: parseInt(e.target.value) || 0 } : w
                            )
                            updatePanel(currentPanel.id, { widgets: updatedWidgets })
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Max Value</label>
                      <input
                        type="number"
                        value={selectedWidget.max || 100}
                        onChange={(e) => {
                          if (currentPanel) {
                            const updatedWidgets = currentPanel.widgets.map(w => 
                              w.i === selectedWidget.i ? { ...w, max: parseInt(e.target.value) || 100 } : w
                            )
                            updatePanel(currentPanel.id, { widgets: updatedWidgets })
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>
                )}
                
                {selectedWidget.type === 'slider' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Min Value</label>
                      <input
                        type="number"
                        value={selectedWidget.min || 0}
                        onChange={(e) => {
                          if (currentPanel) {
                            const updatedWidgets = currentPanel.widgets.map(w => 
                              w.i === selectedWidget.i ? { ...w, min: parseInt(e.target.value) || 0 } : w
                            )
                            updatePanel(currentPanel.id, { widgets: updatedWidgets })
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Max Value</label>
                      <input
                        type="number"
                        value={selectedWidget.max || 100}
                        onChange={(e) => {
                          if (currentPanel) {
                            const updatedWidgets = currentPanel.widgets.map(w => 
                              w.i === selectedWidget.i ? { ...w, max: parseInt(e.target.value) || 100 } : w
                            )
                            updatePanel(currentPanel.id, { widgets: updatedWidgets })
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">MQTT Topic</label>
                  <input
                    type="text"
                    value={selectedWidget.mqttTopic || ''}
                    onChange={(e) => {
                      if (currentPanel) {
                        const updatedWidgets = currentPanel.widgets.map(w => 
                          w.i === selectedWidget.i ? { ...w, mqttTopic: e.target.value } : w
                        )
                        updatePanel(currentPanel.id, { widgets: updatedWidgets })
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter MQTT topic"
                  />
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
                  onClick={() => setShowWidgetSettings(false)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CreatePanel