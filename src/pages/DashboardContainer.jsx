import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Edit, 
  BarChart3,
  Settings,
  RefreshCw
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
// Mock data generator for demo purposes
const randomDataGenerator = {
  generateSensorData: () => ({
    temperature: Math.random() * 40 + 20,
    humidity: Math.random() * 100,
    pressure: Math.random() * 200 + 800,
    timestamp: new Date().toISOString()
  }),
  
  generateChartData: (count = 10, min = 0, max = 100) => {
    const data = []
    const now = new Date()
    
    for (let i = count - 1; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - (i * 60000)) // 1 minute intervals
      data.push({
        timestamp: timestamp.toISOString(),
        value: Math.random() * (max - min) + min
      })
    }
    return data
  },
  
  generateMapMarkers: (count = 3) => {
    const markers = []
    for (let i = 0; i < count; i++) {
      markers.push({
        id: `marker-${i}`,
        lat: 37.7749 + (Math.random() - 0.5) * 0.1, // San Francisco area
        lng: -122.4194 + (Math.random() - 0.5) * 0.1,
        title: `Device ${i + 1}`,
        status: Math.random() > 0.5 ? 'online' : 'offline',
        value: Math.random() * 100
      })
    }
    return markers
  },
  
  generateNotifications: (count = 5) => {
    const notifications = []
    const types = ['info', 'warning', 'error', 'success']
    const messages = [
      'Temperature threshold exceeded',
      'Device offline detected',
      'New data received',
      'System update available',
      'Battery low warning',
      'Connection restored',
      'Maintenance scheduled',
      'Alert cleared'
    ]
    
    for (let i = 0; i < count; i++) {
      notifications.push({
        id: `notification-${i}`,
        type: types[Math.floor(Math.random() * types.length)],
        message: messages[Math.floor(Math.random() * messages.length)],
        timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(), // Within last hour
        read: Math.random() > 0.3
      })
    }
    return notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  }
}

export default function DashboardContainer() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { panels, currentPanel, setCurrentPanel } = usePanelStore()
  const [widgetData, setWidgetData] = useState({})
  const [showWidgetSettings, setShowWidgetSettings] = useState(false)
  const [selectedWidget, setSelectedWidget] = useState(null)
  const [isSharedAccess, setIsSharedAccess] = useState(false)
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Get panel ID and shared status from URL
  const panelId = searchParams.get('panel')
  const isShared = searchParams.get('shared') === 'true'

  // Generate random data for widgets in the current panel
  const generateWidgetData = useCallback(() => {
    console.log('DashboardContainer: generateWidgetData called')
    console.log('DashboardContainer: currentPanel:', currentPanel)
    console.log('DashboardContainer: currentPanel.widgets:', currentPanel?.widgets)
    
    if (!currentPanel || !currentPanel.widgets) {
      console.log('DashboardContainer: No currentPanel or widgets, returning early')
      return
    }

    const newWidgetData = {}
    console.log('DashboardContainer: Processing widgets:', currentPanel.widgets)
    
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
            data: randomDataGenerator.generateChartData(10, 0, 100)
          }
          break
        case 'sensor-tile':
          newWidgetData[widget.i] = {
            value: (Math.random() * 50 + 20).toFixed(1),
            unit: widget.unit || '°C'
          }
          break
        case 'toggle':
          newWidgetData[widget.i] = {
            status: Math.random() > 0.5
          }
          break
        case 'slider':
          newWidgetData[widget.i] = {
            value: Math.random() * 100,
            min: widget.min || 0,
            max: widget.max || 100
          }
          break
        case 'map':
          newWidgetData[widget.i] = {
            markers: randomDataGenerator.generateMapMarkers(3)
          }
          break
        case '3d-model':
          newWidgetData[widget.i] = {
            rotation: {
              x: Math.random() * 360,
              y: Math.random() * 360,
              z: Math.random() * 360
            }
          }
          break
        case 'notification':
          newWidgetData[widget.i] = {
            notifications: randomDataGenerator.generateNotifications(5)
          }
          break
        default:
          newWidgetData[widget.i] = { value: Math.random() * 100 }
      }
    })
    setWidgetData(newWidgetData)
  }, [currentPanel])

  // Load panel data when component mounts or panelId changes
  useEffect(() => {
    console.log('DashboardContainer: Loading panel with ID:', panelId)
    console.log('DashboardContainer: Available panels:', panels)
    
    if (panelId) {
      const panel = panels.find(p => p.id === panelId)
      console.log('DashboardContainer: Found panel:', panel)
      
      if (panel) {
        setCurrentPanel(panel)
        console.log('DashboardContainer: Set current panel:', panel)
        console.log('DashboardContainer: Panel widgets:', panel.widgets)
        
        // Check if this is shared access
        if (isShared) {
          setIsSharedAccess(true)
          if (!isAuthenticated) {
            setShowPasswordPrompt(true)
          }
        }
      } else {
        console.warn('Panel not found:', panelId)
        // Wait a bit for the panel to be created, then try again
        setTimeout(() => {
          const retryPanel = panels.find(p => p.id === panelId)
          console.log('DashboardContainer: Retry panel found:', retryPanel)
          
          if (retryPanel) {
            setCurrentPanel(retryPanel)
            console.log('DashboardContainer: Set retry panel:', retryPanel)
            console.log('DashboardContainer: Retry panel widgets:', retryPanel.widgets)
            
            // Check if this is shared access
            if (isShared) {
              setIsSharedAccess(true)
              if (!isAuthenticated) {
                setShowPasswordPrompt(true)
              }
            }
          } else {
            console.error('Panel still not found after retry, redirecting to panels list')
            navigate('/')
          }
        }, 500)
      }
    }
  }, [panelId, panels, setCurrentPanel, navigate, isShared, isAuthenticated])

  // Handle password authentication
  const handlePasswordSubmit = useCallback(() => {
    if (currentPanel && currentPanel.sharePassword) {
      if (passwordInput.toUpperCase() === currentPanel.sharePassword) {
        setIsAuthenticated(true)
        setShowPasswordPrompt(false)
        setPasswordInput('')
      } else {
        alert('Incorrect password. Please try again.')
        setPasswordInput('')
      }
    }
  }, [passwordInput, currentPanel])

  // Generate initial widget data
  useEffect(() => {
    if (currentPanel) {
      generateWidgetData()
    }
  }, [currentPanel, generateWidgetData])

  // Auto-refresh widget data every 5 seconds
  useEffect(() => {
    if (!currentPanel) return

    const interval = setInterval(() => {
      generateWidgetData()
    }, 5000)

    return () => clearInterval(interval)
  }, [currentPanel, generateWidgetData])

  // Memoized panel data to prevent unnecessary re-renders
  const memoizedPanel = useMemo(() => {
    if (!currentPanel) return null
    return {
      ...currentPanel,
      widgets: currentPanel.widgets || []
    }
  }, [currentPanel])

  // Render widget function
  const renderWidget = useCallback((widget) => {
    const data = widgetData[widget.i] || {}
    
    switch (widget.type) {
      case 'gauge':
        return (
          <GaugeWidget
            value={data.value || widget.value || 50}
            max={data.max || widget.max || 100}
            min={data.min || widget.min || 0}
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
            data={data.data}
            size="small"
          />
        )
      case 'map':
        return (
          <MapWidget
            widgetId={widget.i}
            mqttTopic={widget.mqttTopic}
            title={widget.title || 'Device Map'}
            markers={data.markers}
            size="small"
          />
        )
      case 'notification':
        return (
          <NotificationWidget
            widgetId={widget.i}
            mqttTopic={widget.mqttTopic}
            title={widget.title || 'Notifications'}
            notifications={data.notifications}
            size="small"
          />
        )
      case 'toggle':
        return (
          <ToggleWidget
            name={widget.title || 'Toggle'}
            status={data.status !== undefined ? data.status : widget.status || false}
            location={widget.location || 'Device Location'}
          />
        )
      case 'sensor-tile':
        return (
          <SimpleSensorWidget
            value={data.value || widget.value || '0'}
            title={widget.title || 'Sensor'}
            unit={data.unit || widget.unit || ''}
          />
        )
      case 'slider':
        return (
          <SliderWidget
            widgetId={widget.i}
            mqttTopic={widget.mqttTopic}
            title={widget.title || 'Slider Control'}
            value={data.value || widget.value || 50}
            min={data.min || widget.min || 0}
            max={data.max || widget.max || 100}
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
            rotation={data.rotation}
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
  }, [widgetData])

  // Handle edit panel
  const handleEditPanel = () => {
    if (currentPanel) {
      navigate(`/create?edit=${currentPanel.id}`)
    }
  }

  // Handle back navigation
  const handleBack = () => {
    navigate('/')
  }


  // Handle refresh
  const handleRefresh = () => {
    generateWidgetData()
  }

  if (!memoizedPanel) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Dashboard...</h2>
          <p className="text-gray-600">Please wait while we load your dashboard.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleBack}
              variant="outline"
              size="sm"
              className="text-gray-600 border-gray-300 hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Panels
            </Button>
            
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-6 h-6 text-red-500" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{memoizedPanel.name}</h1>
                <p className="text-sm text-gray-500">
                  {memoizedPanel.widgets.length} widgets • Last updated {new Date(memoizedPanel.updatedAt || memoizedPanel.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="text-gray-600 border-gray-300 hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            
            
            {!isSharedAccess && (
              <Button
                onClick={handleEditPanel}
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Dashboard
              </Button>
            )}
            
            {isSharedAccess && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-800 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Shared View</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dashboard Container */}
      {(!isSharedAccess || (isSharedAccess && isAuthenticated)) && (
        <div className="flex-1 overflow-auto p-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Dashboard Content */}
            <div className="p-6">
              {memoizedPanel.widgets && memoizedPanel.widgets.length > 0 ? (
                <div className="min-h-[800px] pb-8">
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
                <div className="min-h-[600px] flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">No Widgets Found</h3>
                    <p className="text-sm mb-4">This dashboard doesn't have any widgets yet.</p>
                    {!isSharedAccess && (
                      <Button
                        onClick={handleEditPanel}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Add Widgets
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Access Denied Message for Unauthenticated Shared Access */}
      {isSharedAccess && !isAuthenticated && !showPasswordPrompt && (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Required</h3>
            <p className="text-gray-500 mb-4">This dashboard requires authentication to view.</p>
            <Button
              onClick={() => setShowPasswordPrompt(true)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Enter Password
            </Button>
          </div>
        </div>
      )}


      {/* Password Prompt Modal for Shared Access */}
      {showPasswordPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Access Dashboard</h3>
                <button
                  onClick={() => navigate('/')}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-blue-800 text-sm">This dashboard requires a password to access.</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Enter Access Password</label>
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-center text-lg font-mono tracking-widest"
                    placeholder="Enter password"
                    autoFocus
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-start">
                    <svg className="w-4 h-4 text-yellow-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <p className="text-yellow-800 text-xs">
                      You will have view and control access but cannot edit the dashboard layout.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  onClick={() => navigate('/')}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordSubmit}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                >
                  Access Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
