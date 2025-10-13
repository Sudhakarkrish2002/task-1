import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Lock, Eye, Copy, Check, Wifi, WifiOff } from 'lucide-react'
import { EnhancedGridLayout } from './grid/EnhancedGridLayout'
import { Button } from './ui/button'
import { autoFixOverlaps } from '../lib/gridUtils'
import { GaugeWidget } from './widgets/gauge-widget'
import { ChartWidget } from './widgets/chart-widget'
import { MapWidget } from './widgets/map-widget'
import { NotificationWidget } from './widgets/notification-widget'
import { ToggleWidget } from './widgets/toggle-widget'
import { SimpleSensorWidget } from './widgets/simple-sensor-widget'
import { SliderWidget } from './widgets/slider-widget'
import { Model3DWidget } from './widgets/model3d-widget'
import { Gauge360Widget } from './widgets/gauge360-widget'
import { LEDWidget } from './widgets/led-widget'
import { TactButtonWidget } from './widgets/tact-button-widget'
import { TerminalWidget } from './widgets/terminal-widget'
import sharingService from '../services/sharingService'
import dashboardService from '../services/dashboardService'
import mqttService from '../services/mqttService'
import './SharedDashboardView.css'

// Device detection hook for responsive behavior
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
 * Shared Dashboard View Component
 * Displays a published dashboard in read-only mode with password protection
 */
export const SharedDashboardView = ({ panelId, onAccessGranted }) => {
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [dashboardData, setDashboardData] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [mqttConnected, setMqttConnected] = useState(false)
  const { isMobile, isTablet, isDesktop } = useDeviceType()

  // CRITICAL FIX: Establish MQTT connection when authenticated
  // This is the ONLY MQTT setup needed - widgets will handle their own subscriptions
  useEffect(() => {
    if (!isAuthenticated) {
      setMqttConnected(false)
      return
    }

    const connectMqtt = async () => {
      try {
        console.log('🔌 SharedDashboard: Connecting to MQTT...')
        
        // CRITICAL: Load cached MQTT values from localStorage BEFORE connecting
        // This ensures shared dashboard shows last values immediately
        console.log('📦 SharedDashboard: Loading cached MQTT values from localStorage...')
        try {
          const cacheData = localStorage.getItem('mqtt-cache')
          if (cacheData) {
            const cache = JSON.parse(cacheData)
            const expiresAt = new Date(cache.expiresAt)
            const now = new Date()
            
            if (now < expiresAt && cache.values) {
              // Cache is still valid, restore it to mqttService
              console.log(`💾 SharedDashboard: Found ${Object.keys(cache.values).length} cached MQTT values`)
              Object.entries(cache.values).forEach(([topic, value]) => {
                // Restore the cached value to mqttService
                mqttService.lastValues.set(topic, value)
                console.log(`✅ Restored cached value for topic ${topic}:`, value.value)
              })
              console.log('✅ SharedDashboard: Cached MQTT values restored successfully')
            } else {
              console.log('⚠️ SharedDashboard: MQTT cache expired, will wait for live data')
              localStorage.removeItem('mqtt-cache')
            }
          } else {
            console.log('ℹ️ SharedDashboard: No cached MQTT values found')
          }
        } catch (cacheError) {
          console.error('❌ Error loading MQTT cache:', cacheError)
        }
        
        // Check if already connected
        if (mqttService.isConnected) {
          console.log('✅ SharedDashboard: MQTT already connected')
          setMqttConnected(true)
          return
        }

        // Connect to MQTT
        await mqttService.connect()
        console.log('✅ SharedDashboard: MQTT connected successfully')
        console.log('📊 Widgets will now handle their own subscriptions via useRealtimeData hook')
        setMqttConnected(true)
      } catch (error) {
        console.error('❌ SharedDashboard: Failed to connect to MQTT:', error)
        setMqttConnected(false)
        
        // Retry after 3 seconds
        setTimeout(() => {
          console.log('🔄 SharedDashboard: Retrying MQTT connection...')
          mqttService.resetConnectionAttempt()
          connectMqtt()
        }, 3000)
      }
    }

    connectMqtt()
    
    // Cleanup on unmount
    return () => {
      console.log('🧹 SharedDashboard: Component unmounting')
    }
  }, [isAuthenticated])

  // Load dashboard data
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setIsLoading(true)
        
        // Try to get from backend API first
        try {
          const apiResult = await dashboardService.getSharedDashboard(panelId)
          if (apiResult && apiResult.success !== false) {
            const dashboard = apiResult.dashboard || apiResult
            console.log('🔍 SharedDashboardView - Loaded data from backend:', dashboard.title)

            const normalizedData = {
              ...dashboard,
              layouts: dashboard.layouts || dashboard.layout || {}
            }
            setDashboardData(normalizedData)
            setIsLoading(false)
            return
          }
        } catch (apiError) {
          console.log('Backend API not available, trying local sources')
        }
        
        // Try to get from sharing service
        const shareResult = sharingService.getSharedPanel(panelId)
        if (shareResult.success) {
          console.log('🔍 SharedDashboardView - Loaded data from sharing service:', shareResult.panel)
          console.log('🔍 Widgets count:', shareResult.panel.widgets?.length || 0)
          console.log('🔍 Layouts:', shareResult.panel.layouts || shareResult.panel.layout)
          console.log('🔍 Widgets data:', shareResult.panel.widgets)
          
          // Normalize the data structure
          const normalizedData = {
            ...shareResult.panel,
            layouts: shareResult.panel.layouts || shareResult.panel.layout || {}
          }
          setDashboardData(normalizedData)
          setIsLoading(false)
          return
        }

        // Fallback to localStorage for backward compatibility
        const storedData = localStorage.getItem(`published-${panelId}`)
        if (storedData) {
          const data = JSON.parse(storedData)
          console.log('🔍 SharedDashboardView - Loaded data from localStorage:', data.title)
          
          // Normalize the data structure
          const normalizedData = {
            ...data,
            layouts: data.layouts || data.layout || {}
          }
          setDashboardData(normalizedData)
          setIsLoading(false)
          return
        }

        // If not found anywhere, show error
        setError(shareResult.error || 'Dashboard not found or has expired')
        setIsLoading(false)
      } catch (err) {
        console.error('Error loading shared dashboard:', err)
        setError('Failed to load dashboard')
        setIsLoading(false)
      }
    }

    if (panelId) {
      loadDashboard()
    }
  }, [panelId])

  // Handle password authentication
  const handlePasswordSubmit = useCallback((e) => {
    e.preventDefault()
    
    console.log('🔐 Password authentication attempt:', {
      enteredPassword: password,
      expectedPassword: dashboardData?.sharePassword,
      dashboardData: dashboardData
    })
    
    if (!dashboardData) {
      console.error('❌ Dashboard data not available for authentication')
      setError('Dashboard data not available')
      return
    }

    if (password === dashboardData.sharePassword) {
      console.log('✅ Password authentication successful')
      setIsAuthenticated(true)
      setError('')
      if (onAccessGranted) {
        onAccessGranted(dashboardData)
      }
    } else {
      console.log('❌ Password authentication failed:', {
        entered: password,
        expected: dashboardData.sharePassword,
        match: password === dashboardData.sharePassword
      })
      setError('Invalid password')
    }
  }, [password, dashboardData, onAccessGranted])

  // Copy link to clipboard
  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [])

  // Responsive grid calculation
  const getResponsiveGridConfig = useCallback(() => {
    return {
      breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
      cols: { lg: 12, md: 8, sm: 4, xs: 2, xxs: 1 },
      rowHeight: 80,
      margin: [12, 12],
      containerPadding: [12, 12, 24, 12]
    }
  }, [])

  // Calculate responsive widget dimensions
  const calculateWidgetDimensions = useCallback((widget) => {
    const baseWidth = Math.max(4, widget.w || 4) // Ensure minimum width of 4
    const baseHeight = Math.max(3, widget.h || 3) // Ensure minimum height of 3
    
    return {
      w: baseWidth,
      h: baseHeight,
      minW: 2, // Reduced minimum width
      minH: 2, // Reduced minimum height
      maxW: 12, // Maximum width
      maxH: 12, // Maximum height
      // Responsive dimensions for different breakpoints
      lg: { w: baseWidth, h: baseHeight, minW: 2, minH: 2, maxW: 12, maxH: 12 },
      md: { w: Math.min(8, Math.max(2, baseWidth)), h: Math.max(2, baseHeight), minW: 2, minH: 2, maxW: 8, maxH: 12 },
      sm: { w: Math.min(6, Math.max(2, baseWidth)), h: Math.max(2, baseHeight), minW: 2, minH: 2, maxW: 6, maxH: 12 },
      xs: { w: Math.max(2, Math.min(4, baseWidth)), h: Math.max(2, baseHeight), minW: 2, minH: 2, maxW: 4, maxH: 12 },
      xxs: { w: 2, h: Math.max(2, baseHeight), minW: 2, minH: 2, maxW: 2, maxH: 12 }
    }
  }, [])

  // Render widget based on type - EXACTLY like normal dashboard
  // Widgets handle their own MQTT subscriptions via useRealtimeData hook
  const renderWidget = useCallback((widget) => {
    // CRITICAL: Extract MQTT topic from widget config
    // This is the SAME approach as in CreatePanel.jsx
    const widgetMqttTopic = widget.config?.mqttTopic || widget.mqttTopic
    const widgetValuePath = widget.config?.valuePath || widget.valuePath
    
    console.log(`📊 Rendering widget ${widget.id}:`, {
      type: widget.type,
      topic: widgetMqttTopic,
      valuePath: widgetValuePath,
      config: widget.config
    })
    
    const commonProps = {
      widgetId: widget.id,
      title: widget.title || (widget.type === 'sensor-tile' ? 'Sensor' : widget.type),
      connected: mqttConnected,
      deviceInfo: null
    }

    // Render widgets EXACTLY like in CreatePanel.jsx
    switch (widget.type) {
      case 'gauge':
        return <GaugeWidget 
          key={widget.id} 
          {...commonProps} 
          value={0} // Default value, will be overridden by MQTT data via useRealtimeData
          min={widget.config?.minValue || widget.minValue || widget.min || 0}
          max={widget.config?.maxValue || widget.maxValue || widget.max || 100}
          unit={widget.config?.unit || widget.unit || '%'}
          color={widget.config?.color || widget.color || '#ef4444'}
          // CRITICAL: Pass topic to widget - it will use useRealtimeData internally
          topic={widgetMqttTopic}
          valuePath={widgetValuePath}
        />
      
      case 'chart':
        return <ChartWidget 
          key={widget.id} 
          {...commonProps}
          chartType={widget.config?.chartType || widget.chartType || 'line'}
          color={widget.config?.color || widget.color || '#ef4444'}
          // CRITICAL: Pass topic to widget - it will use useRealtimeData internally
          topic={widgetMqttTopic}
          valuePath={widgetValuePath}
        />
      
      case 'map':
        return <MapWidget 
          key={widget.id} 
          {...commonProps} 
          size="small"
          mqttTopic={widgetMqttTopic}
        />
      
      case 'notification':
        return <NotificationWidget 
          key={widget.id} 
          {...commonProps} 
          notifications={[]} 
          setNotifications={() => {}} 
        />
      
      case 'toggle':
        return <ToggleWidget 
          key={widget.id} 
          {...commonProps} 
          isOn={false} 
          setIsOn={() => {}} 
        />
      
      case 'sensor':
      case 'sensor-tile':
        return <SimpleSensorWidget 
          key={widget.id} 
          {...commonProps} 
          value={25} // Default value, will be overridden by MQTT data via useRealtimeData
          unit={widget.config?.unit || widget.unit || '°C'}
          min={widget.config?.minValue || widget.minValue || widget.min || 0}
          max={widget.config?.maxValue || widget.maxValue || widget.max || 100}
          // CRITICAL: Pass topic to widget - it will use useRealtimeData internally
          topic={widgetMqttTopic}
          valuePath={widgetValuePath}
        />
      
      case 'slider':
        return <SliderWidget 
          key={widget.id} 
          {...commonProps} 
          min={widget.config?.minValue || widget.minValue || widget.min || 0}
          max={widget.config?.maxValue || widget.maxValue || widget.max || 100}
          unit={widget.config?.unit || widget.unit || ''}
          color={widget.config?.color || widget.color || '#ef4444'}
          value={50} 
          setValue={() => {}} 
        />
      
      case 'model3d':
      case '3d-model':
        return <Model3DWidget 
          key={widget.id} 
          {...commonProps} 
          modelType={widget.modelType || 'cube'}
          color={widget.color || '#3b82f6'}
          size="small"
          mqttTopic={widgetMqttTopic}
        />
      
      case 'gauge360':
        return <Gauge360Widget 
          key={widget.id} 
          {...commonProps} 
          min={widget.config?.minValue || widget.minValue || widget.min || 0}
          max={widget.config?.maxValue || widget.maxValue || widget.max || 360}
          unit={widget.config?.unit || widget.unit || '°'}
          color={widget.config?.color || widget.color || '#3b82f6'}
          value={180} // Default value, will be overridden by MQTT data
          topic={widgetMqttTopic}
          valuePath={widgetValuePath}
        />
      
      case 'led':
        return <LEDWidget 
          key={widget.id} 
          {...commonProps} 
          isOn={false}
          color={widget.config?.color || widget.color || '#22c55e'}
          stateTopic={widgetMqttTopic}
          valuePath={widgetValuePath}
        />
      
      case 'tact-button':
        return <TactButtonWidget 
          key={widget.id} 
          {...commonProps} 
          isPressed={false}
          buttonLabel={widget.config?.buttonLabel || widget.buttonLabel || 'PRESS'}
          buttonColor={widget.config?.color || widget.color || '#3b82f6'}
          setIsPressed={() => {}}
          stateTopic={widgetMqttTopic}
          commandTopic={widget.config?.commandTopic || widget.commandTopic}
          valuePath={widgetValuePath}
        />
      
      case 'terminal':
        return <TerminalWidget 
          key={widget.id} 
          {...commonProps} 
          logs={[]}
          maxLines={widget.config?.maxLines || widget.maxLines || 50}
          topic={widgetMqttTopic}
          valuePath={widgetValuePath}
          textColor={widget.config?.textColor || widget.textColor || '#00ff00'}
          backgroundColor={widget.config?.backgroundColor || widget.backgroundColor || '#0a0a0a'}
        />
      
      default:
        return (
          <div key={widget.id} className="p-4 bg-gray-100 rounded-lg text-center text-gray-500">
            Unknown widget type: {widget.type}
          </div>
        )
    }
  }, [mqttConnected])

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Dashboard...</h2>
          <p className="text-gray-600">Please wait while we load the shared dashboard</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    )
  }

  // Password prompt
  if (!isAuthenticated && dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center mb-6">
            <Lock className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Shared Dashboard
            </h2>
            <p className="text-gray-600">
              This dashboard is password protected. Enter the password to view.
            </p>
            {/* Debug: Show password for testing */}
            {dashboardData?.sharePassword && (
              <div className="mt-4 p-3 bg-yellow-100 border border-yellow-400 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Debug:</strong> Password is: <code className="bg-yellow-200 px-1 rounded">{dashboardData.sharePassword}</code>
                </p>
              </div>
            )}
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter dashboard password"
                required
              />
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700"
            >
              Access Dashboard
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Dashboard:</span>
              <button
                onClick={copyLink}
                className="flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy Link
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Main dashboard view
  if (isAuthenticated && dashboardData) {
    const gridConfig = getResponsiveGridConfig()
    const widgets = dashboardData.widgets || []
    const layouts = dashboardData.layouts || {}

    // Convert widgets to simple items for display (no complex positioning needed)
    const gridItems = widgets.map((widget, index) => {
      // Create a simple widget item for the new layout
      const simpleItem = {
        ...widget,
        i: widget.i || widget.id || `widget-${index}`, // Ensure unique ID
        id: widget.id || widget.i || `widget-${index}`,
        type: widget.type,
        title: widget.title || (widget.type === 'sensor-tile' ? 'Sensor' : widget.type),
        // Keep original properties for widget rendering
        config: widget.config || {},
        data: widget.data || {},
        // CRITICAL FIX: Extract MQTT topic and valuePath from config to top level for easier access
        mqttTopic: widget.config?.mqttTopic || widget.mqttTopic || panelId,
        valuePath: widget.config?.valuePath || widget.valuePath,
        // Extract other config properties to top level
        minValue: widget.config?.minValue || widget.minValue,
        maxValue: widget.config?.maxValue || widget.maxValue,
        unit: widget.config?.unit || widget.unit,
        color: widget.config?.color || widget.color,
        chartType: widget.config?.chartType || widget.chartType,
        // Add index for display order
        displayIndex: index
      }
      return simpleItem
    })

    // Use the simple grid items directly (no complex positioning needed)
    const displayItems = gridItems

    return (
      <div className="min-h-screen bg-gray-50">

        {/* Shared Dashboard Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {dashboardData.title || 'Shared Dashboard'}
              </h1>
              <p className="text-gray-600 mt-1">
                Shared dashboard • {widgets.length} widgets
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* MQTT Connection Status */}
              <div className="flex items-center space-x-2">
                {mqttConnected ? (
                  <div className="flex items-center text-green-600">
                    <Wifi className="w-4 h-4 mr-1" />
                    <span className="text-sm">Live Data</span>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-2"></div>
                  </div>
                ) : (
                  <div className="flex items-center text-gray-400">
                    <WifiOff className="w-4 h-4 mr-1" />
                    <span className="text-sm">Connecting...</span>
                  </div>
                )}
              </div>
              
              <div className="text-sm text-gray-500">
                {isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'} View
              </div>
              <button
                onClick={copyLink}
                className="flex items-center px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy Link
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Simple Responsive Grid Layout for Shared Dashboard */}
        <div className="shared-dashboard-grid p-6" style={{ minHeight: '800px' }}>
          {/* MQTT Connection Status */}
          {!mqttConnected && isAuthenticated && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="font-semibold text-yellow-800">Connecting to live data...</span>
              </div>
              <p className="mt-2 text-yellow-700">Please wait while we establish the MQTT connection for real-time updates.</p>
            </div>
          )}
          
          {displayItems.length > 0 ? (
            <div className="space-y-6">
              {/* Dashboard Status */}
              <div className="mb-4 p-3 bg-blue-100 rounded-lg text-sm flex items-center justify-between">
                <div>
                  <strong>Dashboard Status:</strong> Displaying {displayItems.length} widgets
                </div>
                <div className="flex items-center space-x-2">
                  {mqttConnected ? (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-700 font-semibold">Live Data Active</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span className="text-gray-600">Connecting...</span>
                    </>
                  )}
                </div>
              </div>
              
              {/* Simple responsive grid that works reliably */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayItems.map((widget, index) => (
                  <div 
                    key={widget.i || widget.id || index} 
                    className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-200"
                    style={{ minHeight: '300px' }}
                  >
                    {/* Widget Content - widgets handle their own headers and connection status */}
                    <div className="h-full">
                      {renderWidget(widget)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-96">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Empty Dashboard</h3>
                <p className="text-gray-600 mb-4">
                  No widgets found in this shared dashboard.
                </p>
                <div className="text-sm text-gray-500">
                  <p>Debug info:</p>
                  <p>Widgets count: {widgets.length}</p>
                  <p>Grid items: {gridItems.length}</p>
                  <p>Display items: {displayItems.length}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-gray-200 px-6 py-4 mt-8">
          <div className="text-center text-sm text-gray-500">
            <p>This is a shared dashboard. Editing is disabled.</p>
            <p className="mt-1">
              Shared on {new Date(dashboardData.publishedAt || Date.now()).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default SharedDashboardView


