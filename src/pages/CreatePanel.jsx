import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useNavigation } from '../hooks/useNavigation'
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
  const { handleNavigation } = useNavigation()
  const [searchParams] = useSearchParams()
  const [panelName, setPanelName] = useState('New Dashboard')
  const [mqttConnected, setMqttConnected] = useState(false)
  const [showWidgetSettings, setShowWidgetSettings] = useState(false)
  const [selectedWidget, setSelectedWidget] = useState(null)
  const [widgetSettings, setWidgetSettings] = useState({})
  const [isOnline, setIsOnline] = useState(true)
  const [isPublishing, setIsPublishing] = useState(false)
  const [showSharingModal, setShowSharingModal] = useState(false)
  const [shareableLink, setShareableLink] = useState('')
  const [sharePassword, setSharePassword] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  
  const { createPanel, updatePanel, currentPanel, setCurrentPanel, panels } = usePanelStore()
  const { devices, addDevice } = useDeviceStore()
  
  // Ref to store current grid data
  const currentGridDataRef = useRef(null)
  // Ref to access GridManager methods
  const gridManagerRef = useRef(null)

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
        // Panel not found, wait a bit for store to update, then redirect
        const timeoutId = setTimeout(() => {
          const panelToEditRetry = panels.find(p => p.id === editPanelId)
          if (!panelToEditRetry) {
            console.warn('Panel not found after retry, redirecting to panels list')
            handleNavigation('/')
          }
        }, 100)
        
        return () => clearTimeout(timeoutId)
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
    setWidgetSettings({
      title: widget.title || '',
      dataType: widget.dataType || 'int',
      entryType: widget.entryType || 'automatic',
      minValue: widget.minValue || 0,
      maxValue: widget.maxValue || 100,
      dataChannelId: widget.dataChannelId || 0
    })
    setShowWidgetSettings(true)
  }, [])

  // Handle widget settings save
  const handleWidgetSettingsSave = useCallback(() => {
    if (selectedWidget && currentPanel) {
      const updatedWidgets = currentPanel.widgets.map(w => 
        w.i === selectedWidget.i ? { 
          ...w, 
          ...widgetSettings 
        } : w
      )
      
      updatePanel(currentPanel.id, { 
        ...currentPanel, 
        widgets: updatedWidgets 
      })
      
      // Update the selected widget state
      setSelectedWidget({ ...selectedWidget, ...widgetSettings })
      
      // Update the grid widgets immediately
      const updateEvent = new CustomEvent('updateGridWidget', {
        detail: { 
          widgetId: selectedWidget.i, 
          updates: widgetSettings 
        }
      })
      window.dispatchEvent(updateEvent)
      
      // Close the modal
      setShowWidgetSettings(false)
      
      // Show success message
      alert('Widget settings saved successfully!')
    }
  }, [selectedWidget, currentPanel, widgetSettings, updatePanel])

  // Render widget function
  const renderWidget = useCallback((widget) => {
    switch (widget.type) {
      case 'gauge':
        return (
          <GaugeWidget
            value={widget.value || 50}
            max={widget.maxValue || widget.max || 100}
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
            min={widget.minValue || widget.min || 0}
            max={widget.maxValue || widget.max || 100}
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
    console.log('handleSave function called with data:', data)
    setIsSaving(true)
    
    try {
      // Store current grid data in ref for publishing
      currentGridDataRef.current = data
      
      const panelData = {
        name: panelName,
        widgets: data.widgets,
        layout: data.layouts,
        deviceCount: data.widgets.length,
        stats: data.stats
      }
      
      console.log('Saving panel data:', panelData)
      console.log('Widgets being saved:', data.widgets)
      
      let savedPanel
      if (currentPanel) {
        updatePanel(currentPanel.id, panelData)
        savedPanel = { ...currentPanel, ...panelData }
        console.log('Panel updated successfully:', panelData)
        alert('Dashboard saved successfully!')
      } else {
        savedPanel = createPanel(panelData)
        setCurrentPanel(savedPanel)
        console.log('New panel created successfully:', panelData)
        alert('New dashboard created and saved successfully!')
      }
      
      // Redirect to the dashboard after saving
      if (savedPanel && savedPanel.id) {
        const redirectUrl = `/dashboard-container?panel=${savedPanel.id}`
        console.log('Redirecting to:', redirectUrl)
        handleNavigation(redirectUrl)
      } else {
        console.log('No savedPanel or ID, not redirecting. savedPanel:', savedPanel)
      }
    } catch (error) {
      console.error('Error saving dashboard:', error)
      alert('Failed to save dashboard. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }, [panelName, currentPanel, createPanel, updatePanel, setCurrentPanel, navigate])

  // Handle save button click
  const handleSaveClick = useCallback(() => {
    console.log('Save button clicked!')
    console.log('handleSave function:', handleSave)
    
    // Get current grid data and save
    const saveEvent = new CustomEvent('gridManagerSave', {
      detail: { callback: handleSave }
    })
    window.dispatchEvent(saveEvent)
    console.log('Save event dispatched with callback:', handleSave)
  }, [handleSave])


  // Separate function to handle the actual publishing after save
  const publishDashboard = useCallback(async (gridData) => {
    try {
      console.log('Publishing dashboard with data:', gridData)
      
      // Create panel data with the current grid state
      const panelToPublish = {
        id: currentPanel?.id || `demo-panel-${Date.now()}`,
        name: panelName || 'Demo Dashboard',
        widgets: gridData?.widgets || [],
        layout: gridData?.layouts || {},
        deviceCount: gridData?.widgets?.length || 0,
        stats: gridData?.stats || { totalWidgets: 0, gridUtilization: 0 },
        createdAt: currentPanel?.createdAt || new Date().toISOString()
      }
      
      // Simulate publishing process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Generate shareable link using the new shared route structure
      const baseUrl = window.location.origin
      const shareableId = `panel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const generatedLink = `${baseUrl}/shared/${shareableId}`
      
      // Generate random password
      const generatedPassword = Math.random().toString(36).substring(2, 8).toUpperCase()
      
      // Update panel to published status with sharing info
      updatePanel(panelToPublish.id, { 
        ...panelToPublish, 
        isPublished: true, 
        publishedAt: new Date().toISOString(),
        shareableLink: generatedLink,
        sharePassword: generatedPassword,
        shareableId: shareableId
      })

      // Save the published dashboard data for shared access
      const publishedData = {
        panelId: shareableId,
        widgets: panelToPublish.widgets || [],
        layouts: panelToPublish.layout || {},
        title: panelToPublish.name || 'Shared Dashboard',
        stats: { totalWidgets: (panelToPublish.widgets || []).length, gridUtilization: 0 },
        sharePassword: generatedPassword,
        publishedAt: new Date().toISOString(),
        isShared: true
      }
      
      // Store in localStorage for demo purposes (this would be stored in a database in production)
      localStorage.setItem(`published-${shareableId}`, JSON.stringify(publishedData))
      
      // Set sharing data for modal
      setShareableLink(generatedLink)
      setSharePassword(generatedPassword)
      
      console.log('About to show sharing modal...')
      console.log('shareableLink:', generatedLink)
      console.log('sharePassword:', generatedPassword)
      
      // Show sharing modal
      setShowSharingModal(true)
      
      console.log('Dashboard published successfully!')
      console.log('Shareable link:', generatedLink)
      console.log('Password:', generatedPassword)
      console.log('showSharingModal should be true now')
      
    } catch (error) {
      console.error('Error in publishDashboard:', error)
      alert('Failed to publish dashboard. Please try again.')
    } finally {
      setIsPublishing(false)
    }
  }, [currentPanel, updatePanel, panelName, createPanel, setCurrentPanel])

  // Handle publish dashboard
  const handlePublish = useCallback(async () => {
    console.log('Publish button clicked!')
    
    setIsPublishing(true)
    
    try {
      // First save the current state to get the latest grid data
      const saveEvent = new CustomEvent('gridManagerSave', {
        detail: { 
          callback: (data) => {
            console.log('Publish: Save callback received data:', data)
            publishDashboard(data)
          }
        }
      })
      window.dispatchEvent(saveEvent)
      
    } catch (error) {
      console.error('Error publishing dashboard:', error)
      alert('Failed to publish dashboard. Please try again.')
      setIsPublishing(false)
    }
  }, [publishDashboard])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Top Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Save & Publish buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleSaveClick}
              disabled={isSaving}
              className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Save
                </>
              )}
            </button>
            
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPublishing ? (
                <>
                  <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Publishing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Publish
                </>
              )}
            </button>
          </div>
          
          {/* Center - Panel Name */}
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={panelName}
              onChange={(e) => setPanelName(e.target.value)}
              className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900 text-center"
            />
            <span className="text-sm text-gray-500">Dashboard Editor</span>
          </div>
          
          {/* Right side - Online/Offline Indicator */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'} ${isOnline ? 'animate-pulse' : ''}`}></div>
              <span className="text-sm font-medium text-gray-700">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Manager */}
      <GridManager
        ref={gridManagerRef}
        title={panelName}
        initialWidgets={currentPanel?.widgets || []}
        initialLayouts={currentPanel?.layout || {}}
        renderWidget={renderWidget}
        onSave={handleSave}
        onWidgetSettings={handleWidgetSettings}
        showPalette={true}
        showToolbar={true}
        widgetTypes={widgetTypes}
        className="h-[calc(100vh-60px)]"
      />

      {/* Enhanced Widget Settings Modal */}
      {showWidgetSettings && selectedWidget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
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
              
              <div className="space-y-6">
                {/* Widget Type (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Widget Type</label>
                  <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-600 capitalize">
                    {selectedWidget.type || 'Unknown'}
                  </div>
                </div>
                
                {/* 1. Widget Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Widget Title</label>
                  <input
                    type="text"
                    value={widgetSettings.title || ''}
                    onChange={(e) => setWidgetSettings({ ...widgetSettings, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter widget title"
                  />
                </div>
                
                {/* 2. Data Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data Type</label>
                  <select
                    value={widgetSettings.dataType || 'int'}
                    onChange={(e) => setWidgetSettings({ ...widgetSettings, dataType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Value</label>
                    <input
                      type="number"
                      value={widgetSettings.maxValue || 100}
                      onChange={(e) => setWidgetSettings({ ...widgetSettings, maxValue: parseFloat(e.target.value) || 100 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="100"
                    />
                  </div>
                </div>

                {/* 6. Data Channel ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data Channel ID</label>
                  <select
                    value={widgetSettings.dataChannelId || 0}
                    onChange={(e) => setWidgetSettings({ ...widgetSettings, dataChannelId: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value={0}>Channel 0</option>
                    <option value={1}>Channel 1</option>
                    <option value={2}>Channel 2</option>
                    <option value={3}>Channel 3</option>
                    <option value={4}>Channel 4</option>
                    <option value={5}>Channel 5</option>
                    <option value={6}>Channel 6</option>
                  </select>
                </div>
                
                
              </div>
              
              {/* Save Button */}
              <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowWidgetSettings(false)}
                  className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleWidgetSettingsSave}
                  className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                >
                  Save Configuration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Publishing & Sharing Modal */}
      {console.log('Rendering modal check - showSharingModal:', showSharingModal)}
      {showSharingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]" style={{zIndex: 9999}}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-semibold text-gray-900">Dashboard Published Successfully!</h3>
                <button
                  onClick={() => setShowSharingModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Success Message */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-green-800 font-medium">Your dashboard is now live and ready for sharing!</p>
                  </div>
                </div>

                {/* Shareable Link */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Shareable Link</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={shareableLink}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 font-mono text-sm"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(shareableLink)
                        alert('Link copied to clipboard!')
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Access Password</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={sharePassword}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 font-mono text-lg font-bold text-center"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(sharePassword)
                        alert('Password copied to clipboard!')
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                {/* Sharing Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">How to Share:</h4>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Share the link above with your team members</li>
                    <li>Provide them with the access password</li>
                    <li>Shared users can view and control the dashboard</li>
                    <li>Editing is disabled for shared users (view-only mode)</li>
                  </ol>
                </div>

                {/* Access Control Info */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-yellow-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <h4 className="text-sm font-medium text-yellow-900 mb-1">Access Control</h4>
                      <p className="text-sm text-yellow-800">
                        Shared users will have view and control access but cannot edit the dashboard layout or settings.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowSharingModal(false)}
                  className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    // Copy both link and password
                    const shareText = `Dashboard Link: ${shareableLink}\nPassword: ${sharePassword}`
                    navigator.clipboard.writeText(shareText)
                    alert('Link and password copied to clipboard!')
                  }}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                >
                  Copy All
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