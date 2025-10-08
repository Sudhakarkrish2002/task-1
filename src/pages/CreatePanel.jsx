import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useNavigation } from '../hooks/useNavigation'
import { usePanelStore } from '../stores/usePanelStore'
import { useDeviceStore } from '../stores/useDeviceStore'
import dashboardService from '../services/dashboardService'
import { Hash, Copy, Check } from 'lucide-react'
import { GaugeWidget } from '../components/widgets/gauge-widget'
import { ChartWidget } from '../components/widgets/chart-widget'
import { MapWidget } from '../components/widgets/map-widget'
import { NotificationWidget } from '../components/widgets/notification-widget'
import { ToggleWidget } from '../components/widgets/toggle-widget'
import { SimpleSensorWidget } from '../components/widgets/simple-sensor-widget'
import { SliderWidget } from '../components/widgets/slider-widget'
import { Model3DWidget } from '../components/widgets/model3d-widget'
import ProfessionalGridManager from '../components/grid/ProfessionalGridManager'
 
function CreatePanel() {
  const navigate = useNavigate()
  const { handleNavigation } = useNavigation()
  const [searchParams] = useSearchParams()
  const [panelName, setPanelName] = useState('New Dashboard')
  const [showWidgetSettings, setShowWidgetSettings] = useState(false)
  const [selectedWidget, setSelectedWidget] = useState(null)
  const [widgetSettings, setWidgetSettings] = useState({})
  const [isOnline, setIsOnline] = useState(true)
  const [isPublishing, setIsPublishing] = useState(false)
  const [showSharingModal, setShowSharingModal] = useState(false)
  const [mqttConnected, setMqttConnected] = useState(false)
  const [shareableLink, setShareableLink] = useState('')
  const [sharePassword, setSharePassword] = useState('')
  const [publishedDashboard, setPublishedDashboard] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isTopicIdCopied, setIsTopicIdCopied] = useState(false)
  
  const { createPanel, updatePanel, currentPanel, setCurrentPanel, panels } = usePanelStore()
  const { devices, addDevice } = useDeviceStore()
  
  // Ref to store current grid data
  const currentGridDataRef = useRef(null)
  // Ref to access GridManager methods
  const gridManagerRef = useRef(null)

  // Copy topic ID function
  const copyTopicId = async () => {
    if (currentPanel?.topicId) {
      try {
        await navigator.clipboard.writeText(currentPanel.topicId)
        setIsTopicIdCopied(true)
        setTimeout(() => setIsTopicIdCopied(false), 2000)
      } catch (error) {
        console.error('Failed to copy topic ID:', error)
      }
    }
  }

  // Widget types available in the palette
  const widgetTypes = [
    { type: 'gauge', name: 'Gauge', icon: GaugeWidget, color: 'bg-red-500', bgClass: 'bg-red-100', textClass: 'text-red-600', component: GaugeWidget },
    { type: 'chart', name: 'Chart', icon: ChartWidget, color: 'bg-red-500', bgClass: 'bg-red-100', textClass: 'text-red-600', component: ChartWidget },
    { type: 'toggle', name: 'Toggle', icon: ToggleWidget, color: 'bg-purple-500', bgClass: 'bg-purple-100', textClass: 'text-purple-600', component: ToggleWidget },
    { type: 'slider', name: 'Slider', icon: SliderWidget, color: 'bg-orange-500', bgClass: 'bg-orange-100', textClass: 'text-orange-600', component: SliderWidget },
    { type: 'map', name: 'Map', icon: MapWidget, color: 'bg-red-500', bgClass: 'bg-red-100', textClass: 'text-red-600', component: MapWidget },
    { type: '3d-model', name: '3D Model', icon: Model3DWidget, color: 'bg-indigo-500', bgClass: 'bg-indigo-100', textClass: 'text-indigo-600', component: Model3DWidget },
    { type: 'notification', name: 'Notification', icon: NotificationWidget, color: 'bg-yellow-500', bgClass: 'bg-yellow-100', textClass: 'text-yellow-600', component: NotificationWidget },
    { type: 'sensor-tile', name: 'Sensor Tile', icon: SimpleSensorWidget, color: 'bg-teal-500', bgClass: 'bg-teal-100', textClass: 'text-teal-600', component: SimpleSensorWidget }
  ]

  useEffect(() => {
    // Check MQTT connection status
    if (window.mqttService) {
      const status = window.mqttService.getConnectionStatus()
      setMqttConnected(status.isConnected)
    }
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
      dataChannelId: widget.dataChannelId || 0,
      // MQTT topic used by widgets that support live data (e.g., Gauge)
      mqttTopic: (widget.mqttTopic || '').trim(),
      // Optional JSON value path for structured payloads
      valuePath: (widget.valuePath || '').trim()
    })
    setShowWidgetSettings(true)
  }, [])

  // Handle widget settings save
  const handleWidgetSettingsSave = useCallback(() => {
    if (selectedWidget && currentPanel) {
      // Determine the final data channel ID
      const finalDataChannelId = widgetSettings.dataChannelId === -1 
        ? widgetSettings.customDataChannelId || 0 
        : widgetSettings.dataChannelId
      
      const finalWidgetSettings = {
        ...widgetSettings,
        dataChannelId: finalDataChannelId
      }
      
      const updatedWidgets = currentPanel.widgets.map(w => 
        w.i === selectedWidget.i ? { 
          ...w, 
          ...finalWidgetSettings 
        } : w
      )
      
      updatePanel(currentPanel.id, { 
        ...currentPanel, 
        widgets: updatedWidgets 
      })
      
      // Update the selected widget state
      setSelectedWidget({ ...selectedWidget, ...finalWidgetSettings })
      
      // Update the grid widgets immediately
      const updateEvent = new CustomEvent('updateGridWidget', {
        detail: { 
          widgetId: selectedWidget.i, 
          updates: finalWidgetSettings 
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
            widgetId={widget.i}
            title={widget.title || 'Gauge'}
            min={widget.minValue || widget.min || 0}
            max={widget.maxValue || widget.max || 100}
            unit={widget.unit || '%'}
            color={widget.color || '#ef4444'}
            value={0} // Default value, will be overridden by MQTT data
            connected={mqttConnected} // Use actual MQTT connection status
            deviceInfo={null}
            // Wire MQTT topic into Gauge for live updates
            topic={widget.mqttTopic}
            valuePath={widget.valuePath}
          />
        )
      case 'chart':
        return (
          <ChartWidget
            widgetId={widget.i}
            title={widget.title || 'Chart'}
            chartType={widget.chartType || 'line'}
            color={widget.color || '#ef4444'}
            // Wire MQTT topic into Chart for real-time ECharts updates
            topic={widget.mqttTopic}
            valuePath={widget.valuePath}
          />
        )
      case 'map':
        return (
          <MapWidget
            widgetId={widget.i}
            title={widget.title || 'Device Map'}
            size="small"
            mqttTopic={widget.mqttTopic}
          />
        )
      case 'notification':
        return (
          <NotificationWidget
            widgetId={widget.i}
            title={widget.title || 'Notifications'}
            notifications={[]}
            connected={false}
            deviceInfo={null}
            setNotifications={() => {}}
          />
        )
      case 'toggle':
        return (
          <ToggleWidget
            widgetId={widget.i}
            title={widget.title || 'Toggle'}
            isOn={false}
            connected={false}
            deviceInfo={null}
            setIsOn={() => {}}
          />
        )
      case 'sensor-tile':
        return (
          <SimpleSensorWidget
            widgetId={widget.i}
            title={widget.title || 'Sensor'}
            unit={widget.unit || '°C'}
            min={widget.minValue || widget.min || 0}
            max={widget.maxValue || widget.max || 100}
            value={25}
            connected={false}
            deviceInfo={null}
          />
        )
      case 'slider':
        return (
          <SliderWidget
            widgetId={widget.i}
            title={widget.title || 'Slider'}
            min={widget.minValue || widget.min || 0}
            max={widget.maxValue || widget.max || 100}
            unit={widget.unit || ''}
            color={widget.color || '#ef4444'}
            value={50}
            connected={false}
            deviceInfo={null}
            setValue={() => {}}
          />
        )
      case '3d-model':
        return (
          <Model3DWidget
            widgetId={widget.i}
            title={widget.title || '3D Model'}
            modelType={widget.modelType || 'cube'}
            color={widget.color || '#3b82f6'}
            size="small"
            mqttTopic={widget.mqttTopic}
            connected={false}
            deviceInfo={null}
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

  // Handle widgets change
  const handleWidgetsChange = useCallback((widgets) => {
    console.log('Widgets changed:', widgets)
    // Update the current panel with new widgets
    if (currentPanel) {
      setCurrentPanel({
        ...currentPanel,
        widgets: widgets
      })
    }
  }, [currentPanel, setCurrentPanel])

  // Handle save
  const handleSave = useCallback(async (data) => {
    console.log('handleSave function called with data:', data)
    setIsSaving(true)
    
    try {
      // Store current grid data in ref for publishing
      currentGridDataRef.current = data
      
      // Convert grid widgets to panel widget format if needed
      const convertedWidgets = data.widgets.map(widget => {
        // Create clean widget object with only backend-allowed properties
        const cleanWidget = {
          id: widget.id || widget.i, // Use id or i as the main id
          type: widget.type,
          x: widget.x,
          y: widget.y,
          w: widget.w,
          h: widget.h,
          title: widget.title || `${widget.type.charAt(0).toUpperCase() + widget.type.slice(1)}`,
          // Put additional properties in config object (backend allows config)
          config: {
            dataType: widget.dataType || 'int',
            entryType: widget.entryType || 'automatic',
            minValue: widget.minValue || 0,
            maxValue: widget.maxValue || 100,
            dataChannelId: widget.dataChannelId || 0,
            color: widget.color,
            unit: widget.unit,
            chartType: widget.chartType,
            modelType: widget.modelType,
            mqttTopic: widget.mqttTopic,
            valuePath: widget.valuePath  // CRITICAL: Include valuePath for MQTT data extraction
          }
        }
        
        // Remove any undefined values and the 'i' property
        Object.keys(cleanWidget).forEach(key => {
          if (cleanWidget[key] === undefined || key === 'i') {
            delete cleanWidget[key]
          }
        })
        
        // Clean up config object
        if (cleanWidget.config) {
          Object.keys(cleanWidget.config).forEach(key => {
            if (cleanWidget.config[key] === undefined) {
              delete cleanWidget.config[key]
            }
          })
        }
        
        return cleanWidget
      })
      
      console.log('🔍 Converted widgets for publishing:', convertedWidgets)
      console.log('🔍 First widget structure:', convertedWidgets[0])
      console.log('🔍 Checking for "i" property in first widget:', 'i' in convertedWidgets[0])
      
      const panelData = {
        name: panelName,
        widgets: convertedWidgets,
        layout: data.layouts,
        deviceCount: convertedWidgets.length,
        stats: data.stats
      }
      
      console.log('Saving panel data:', panelData)
      console.log('Widgets being saved:', convertedWidgets)
      
      let savedPanel
      if (currentPanel) {
        // Check if panel exists in backend first
        const existsInBackend = await dashboardService.dashboardExists(currentPanel.id)
        
        if (existsInBackend) {
          // Panel exists in backend, update it
          try {
            const result = await dashboardService.updateDashboard(currentPanel.id, panelData)
            updatePanel(currentPanel.id, panelData)
            savedPanel = { ...currentPanel, ...panelData }
            console.log('Panel updated successfully in backend:', result)
            alert('✅ Panel has been updated!')
            // Redirect to My Panels page after successful save
            setTimeout(() => {
              handleNavigation('/panels')
            }, 1000)
          } catch (backendError) {
            console.log('Backend update failed:', backendError.message)
            throw backendError // This will trigger the fallback
          }
        } else {
          // Panel doesn't exist in backend, create it
          console.log('Panel not found in backend, creating new dashboard...')
          try {
            const createResult = await dashboardService.saveDashboard(panelData)
            savedPanel = { ...currentPanel, ...panelData, id: createResult.dashboard.id }
            updatePanel(currentPanel.id, savedPanel)
            setCurrentPanel(savedPanel)
            console.log('Panel created successfully in backend:', createResult)
            alert('✅ Panel has been saved!')
            // Redirect to My Panels page after successful save
            setTimeout(() => {
              handleNavigation('/panels')
            }, 1000)
          } catch (createError) {
            console.log('Backend create failed, using local storage:', createError.message)
            throw createError // This will trigger the fallback
          }
        }
      } else {
        // Create new panel
        try {
          const result = await dashboardService.saveDashboard(panelData)
          savedPanel = createPanel({ ...panelData, id: result.dashboard.id })
          setCurrentPanel(savedPanel)
          console.log('New panel created successfully:', result)
          alert('✅ New panel has been created!')
          // Redirect to My Panels page after successful save
          setTimeout(() => {
            handleNavigation('/panels')
          }, 1000)
        } catch (backendError) {
          console.log('Backend create failed, using local storage:', backendError.message)
          throw backendError // This will trigger the fallback
        }
      }
      
      // Stay on the create page after saving
      console.log('Panel saved successfully, staying on create page')
    } catch (error) {
      console.error('Error saving dashboard:', error)
      
      // Fallback to local storage if backend fails
      console.log('Backend save failed, falling back to local storage')
      try {
        // Recreate panelData for fallback since it's not in scope here
        const convertedWidgets = data.widgets.map(widget => {
          // Create clean widget object for local storage
          const cleanWidget = {
            id: widget.id || widget.i, // Use id or i as the main id
            i: widget.id || widget.i, // Keep 'i' for local storage compatibility
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
            dataChannelId: widget.dataChannelId || 0
          }
          
          // Remove any undefined values
          Object.keys(cleanWidget).forEach(key => {
            if (cleanWidget[key] === undefined) {
              delete cleanWidget[key]
            }
          })
          
          return cleanWidget
        })
        
        const fallbackPanelData = {
          name: panelName,
          widgets: convertedWidgets,
          layout: data.layouts,
          deviceCount: convertedWidgets.length,
          stats: data.stats
        }
        
        let savedPanel
        if (currentPanel) {
          updatePanel(currentPanel.id, fallbackPanelData)
          savedPanel = { ...currentPanel, ...fallbackPanelData }
          alert('✅ Panel has been saved locally!')
          // Redirect to My Panels page after successful local save
          setTimeout(() => {
            handleNavigation('/panels')
          }, 1000)
        } else {
          savedPanel = createPanel(fallbackPanelData)
          setCurrentPanel(savedPanel)
          alert('✅ New panel has been created locally!')
          // Redirect to My Panels page after successful local save
          setTimeout(() => {
            handleNavigation('/panels')
          }, 1000)
        }
      } catch (fallbackError) {
        console.error('Fallback save also failed:', fallbackError)
        alert('Failed to save dashboard. Please try again.')
      }
    } finally {
      setIsSaving(false)
    }
  }, [panelName, currentPanel, createPanel, updatePanel, setCurrentPanel, navigate])

  // Handle save button click
  const handleSaveClick = useCallback(async () => {
    console.log('Save button clicked!')
    console.log('Current panel state:', currentPanel)
    console.log('Panel name:', panelName)
    console.log('handleSave function:', handleSave)
    
    // Check backend health first
    try {
      const isBackendHealthy = await dashboardService.checkBackendHealth()
      if (!isBackendHealthy) {
        console.log('Backend is not available, will use local storage fallback')
      } else {
        console.log('Backend is healthy, will attempt to save to backend')
      }
    } catch (error) {
      console.log('Backend health check failed, will use local storage fallback')
    }
    
    // Get current grid data and save
    const saveEvent = new CustomEvent('gridManagerSave', {
      detail: { callback: handleSave }
    })
    window.dispatchEvent(saveEvent)
    console.log('Save event dispatched with callback:', handleSave)
  }, [handleSave, currentPanel, panelName])


  // Separate function to handle the actual publishing after save
  const publishDashboard = useCallback(async (gridData) => {
    try {
      console.log('Publishing dashboard with data:', gridData)
      
      // Create panel data with the current grid state
      const panelToPublish = {
        id: currentPanel?.id || `demo-panel-${Date.now()}`,
        // CRITICAL: Use the unique topic ID for MQTT communication
        topicId: currentPanel?.topicId || generateTopicId(),
        name: panelName || 'Demo Dashboard',
        widgets: gridData?.widgets || [],
        layouts: gridData?.layouts || {}, // Fixed: was layout, should be layouts
        deviceCount: gridData?.widgets?.length || 0,
        stats: gridData?.stats || { totalWidgets: 0, gridUtilization: 0 }
        // Note: createdAt is handled by backend, not sent from frontend
      }
      
      // Helper function to generate topic ID if not available
      function generateTopicId() {
        const timestamp = Date.now().toString()
        const randomDigits = Math.floor(Math.random() * 90 + 10).toString() // 10-99
        const topicId = timestamp + randomDigits
        return topicId.substring(0, 15).padEnd(15, '0') // Ensure 15 digits
      }
      
      // Try to publish via backend API
      try {
        const result = await dashboardService.publishDashboard(panelToPublish)
        console.log('Dashboard published via backend:', result)
        
        // Update local panel with published status
        updatePanel(panelToPublish.id, { 
          ...panelToPublish, 
          isPublished: true, 
          publishedAt: result.dashboard.publishedAt,
          shareableLink: result.dashboard.shareableLink,
          sharePassword: result.dashboard.sharePassword,
          shareableId: result.dashboard.shareableId
        })
        
        // Set sharing data for modal
        setShareableLink(result.dashboard.shareableLink)
        setSharePassword(result.dashboard.sharePassword)
        setPublishedDashboard(panelToPublish)
        
        console.log('About to show sharing modal...')
        console.log('shareableLink:', result.dashboard.shareableLink)
        console.log('sharePassword:', result.dashboard.sharePassword)
        console.log('Published dashboard data:', panelToPublish)
        
        // Show sharing modal
        setShowSharingModal(true)
        
        console.log('Dashboard published successfully via backend!')
        
      } catch (backendError) {
        console.error('Backend publish failed, falling back to local:', backendError)
        
        // Fallback to local publishing
        const baseUrl = window.location.origin
        const shareableId = `panel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const generatedLink = `${baseUrl}/shared/${shareableId}`
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
          layouts: panelToPublish.layouts || {},
          title: panelToPublish.name || 'Shared Dashboard',
          stats: { totalWidgets: (panelToPublish.widgets || []).length, gridUtilization: 0 },
          sharePassword: generatedPassword,
          publishedAt: new Date().toISOString(),
          isShared: true
        }
        
        // Store in localStorage for demo purposes
        console.log('🔍 Publishing data to localStorage:', publishedData)
        console.log('🔍 Widgets being published:', publishedData.widgets)
        console.log('🔍 Layouts being published:', publishedData.layouts)
        localStorage.setItem(`published-${shareableId}`, JSON.stringify(publishedData))
        
        // Set sharing data for modal
        setShareableLink(generatedLink)
        setSharePassword(generatedPassword)
        setPublishedDashboard(panelToPublish)
        
        // Show sharing modal
        setShowSharingModal(true)
        
        console.log('Dashboard published locally (backend unavailable)!')
      }
      
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
          
          {/* Center - Panel Name & Topic ID */}
          <div className="flex flex-col items-center space-y-2">
            <div className="flex items-center space-x-4">
              <input
                type="text"
                value={panelName}
                onChange={(e) => setPanelName(e.target.value)}
                className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-0 text-gray-900 text-center"
              />
              <span className="text-sm text-gray-500">Dashboard Editor</span>
            </div>
            
            {/* Topic ID Display */}
            {currentPanel?.topicId && (
              <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1 rounded-lg border">
                <Hash className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-mono text-gray-700">
                  Topic ID: {currentPanel.topicId}
                </span>
                <button
                  onClick={copyTopicId}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  title="Copy Topic ID"
                >
                  {isTopicIdCopied ? (
                    <Check className="w-3 h-3 text-green-600" />
                  ) : (
                    <Copy className="w-3 h-3 text-gray-500" />
                  )}
                </button>
              </div>
            )}
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

      {/* Professional Grid Manager */}
      <ProfessionalGridManager
        initialWidgets={currentPanel?.widgets || []}
        onWidgetsChange={handleWidgetsChange}
        isPreviewMode={false}
        className="h-[calc(100vh-60px)]"
      />

      {/* Enhanced Widget Settings Modal */}
      {showWidgetSettings && selectedWidget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 max-h-[98vh] overflow-y-auto">
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

                {/* MQTT Configuration Section */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    MQTT Configuration (Real-time Data)
                  </h4>
                  
                  {/* MQTT Topic (for live data) */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">MQTT Topic *</label>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${mqttConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className={`text-xs font-medium ${mqttConnected ? 'text-green-600' : 'text-red-600'}`}>
                          {mqttConnected ? 'MQTT Connected' : 'MQTT Disconnected'}
                        </span>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={widgetSettings.mqttTopic || ''}
                      onChange={(e) => setWidgetSettings({ ...widgetSettings, mqttTopic: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                      placeholder="e.g. system/status, home/livingroom/temperature"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      <strong>Required:</strong> Set the MQTT topic to receive real-time data. Use <code className="bg-gray-100 px-1 rounded">system/status</code> for system status updates.
                    </p>
                  </div>

                  {/* Value Path for JSON payloads */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Value Path (JSON) - Optional</label>
                    <input
                      type="text"
                      value={widgetSettings.valuePath || ''}
                      onChange={(e) => setWidgetSettings({ ...widgetSettings, valuePath: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                      placeholder="e.g. payload.temp (leave empty for simple numbers)"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      <strong>Optional:</strong> Leave empty for plain numeric payloads (e.g., 30). Use for JSON objects like <code className="bg-gray-100 px-1 rounded">sensor.temperature</code>.
                    </p>
                  </div>
                </div>

                {/* 6. Data Channel ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data Channel ID</label>
                  <div className="space-y-2">
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
                      <option value={-1}>Manual Entry</option>
                    </select>
                    {widgetSettings.dataChannelId === -1 && (
                      <input
                        type="number"
                        value={widgetSettings.customDataChannelId || ''}
                        onChange={(e) => setWidgetSettings({ ...widgetSettings, customDataChannelId: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Enter custom channel ID"
                        min="0"
                      />
                    )}
                  </div>
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
      {showSharingModal && publishedDashboard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]" style={{zIndex: 9999}}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 flex-shrink-0">
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
            </div>
              
            <div className="px-6 flex-1 overflow-y-auto">
              <div className="space-y-6">
                {/* Success Message */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-green-800 font-medium">Your dashboard "{publishedDashboard.name}" is now live and ready for sharing!</p>
                  </div>
                </div>

                {/* 7. MQTT Topic ID (for live data) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Panel Topic ID</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={currentPanel?.topicId || 'Generating...'}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                      placeholder="Auto-generated 15-digit topic ID"
                    />
                    <button
                      onClick={copyTopicId}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1"
                    >
                      {isTopicIdCopied ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    This is your unique panel topic ID. Use this in MQTT Explorer to publish data to your dashboard widgets.
                  </p>
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
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
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
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
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
            </div>
              
            {/* Action Buttons - Fixed at bottom */}
            <div className="p-6 flex-shrink-0 border-t border-gray-200 bg-white">
              <div className="flex items-center justify-end space-x-3">
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