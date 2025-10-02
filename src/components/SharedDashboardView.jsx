import React, { useState, useEffect, useCallback } from 'react'
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
import sharingService from '../services/sharingService'
import dashboardService from '../services/dashboardService'
import { usePanelMqtt } from '../hooks/usePanelMqtt'
import widgetDataService from '../services/widgetDataService'
import dataSimulator from '../services/dataSimulator'
import { runAllTests } from '../utils/mqttTest'
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
  const [widgetData, setWidgetData] = useState({})
  const [showDebugInfo, setShowDebugInfo] = useState(false)
  const { isMobile, isTablet, isDesktop } = useDeviceType()
  
  // Initialize MQTT for real-time data using topicId
  // Use topicId if available, otherwise fallback to panelId
  const mqttTopic = dashboardData?.topicId || panelId
  const { isSubscribed, connectionStatus } = usePanelMqtt(mqttTopic)

  // Start data simulation when dashboard is loaded (only if no real data is coming)
  useEffect(() => {
    if (dashboardData && dashboardData.widgets && isAuthenticated) {
      console.log('🚀 Dashboard loaded - waiting for real MQTT data...')
      console.log('📊 Widgets to monitor:', dashboardData.widgets)
      
      // Don't start auto-simulation - wait for real MQTT data from MQTT Explorer
      // The widgets will show offline until real data arrives
      console.log('⏳ Waiting for real MQTT data from MQTT Explorer...')
      console.log('📡 Panel topic to publish to:', mqttTopic)
      console.log('📡 Panel ID:', panelId)
      console.log('📡 Topic ID:', dashboardData?.topicId)
    }

    // Cleanup simulation on unmount
    return () => {
      if (panelId) {
        console.log('🛑 Stopping any active simulation for panel:', panelId)
        dataSimulator.stopPanelSimulation(panelId)
      }
    }
  }, [dashboardData, isAuthenticated, panelId])

  // Handle real-time widget data updates
  useEffect(() => {
    if (!mqttTopic || !isAuthenticated) return

    const handleWidgetUpdate = (event) => {
      const { panelId: eventPanelId, widgetId, data } = event.detail
      
      // Match both panelId and topicId for compatibility
      if (eventPanelId === panelId || eventPanelId === mqttTopic) {
        console.log(`🎯 Real-time update for widget ${widgetId}:`, data)
        setWidgetData(prev => ({
          ...prev,
          [widgetId]: {
            ...prev[widgetId],
            data: data,
            lastUpdated: new Date().toISOString(),
            isConnected: true
          }
        }))
      }
    }

    window.addEventListener('mqtt-widget-update', handleWidgetUpdate)
    
    return () => {
      window.removeEventListener('mqtt-widget-update', handleWidgetUpdate)
    }
  }, [mqttTopic, panelId, isAuthenticated])

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
            console.log('🔍 SharedDashboardView - Loaded data from backend:', dashboard)
            console.log('🔍 Widgets count:', dashboard.widgets?.length || 0)
            console.log('🔍 Layouts:', dashboard.layouts)
            console.log('🔍 Widgets data:', dashboard.widgets)

            const normalizedData = {
              ...dashboard,
              layouts: dashboard.layouts || dashboard.layout || {}
            }
            setDashboardData(normalizedData)
            setIsLoading(false)
            return
          }
        } catch (apiError) {
          console.log('Backend API not available, trying local sources:', apiError)
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
          console.log('🔍 SharedDashboardView - Loaded data from localStorage:', data)
          console.log('🔍 Widgets count:', data.widgets?.length || 0)
          console.log('🔍 Layouts:', data.layouts)
          console.log('🔍 Widgets data:', data.widgets)
          
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
    
    if (!dashboardData) {
      setError('Dashboard data not available')
      return
    }

    if (password === dashboardData.sharePassword) {
      setIsAuthenticated(true)
      setError('')
      if (onAccessGranted) {
        onAccessGranted(dashboardData)
      }
    } else {
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

  // Render widget based on type
  const renderWidget = useCallback((widget) => {
    console.log('🎨 Rendering widget:', widget)
    console.log('🎨 Widget ID:', widget.id || widget.i)
    console.log('🎨 Widget type:', widget.type)
    console.log('🎨 Widget position:', { x: widget.x, y: widget.y, w: widget.w, h: widget.h })
    
    // Get real-time data for this widget
    const realTimeData = widgetData[widget.id] || {}
    const isConnected = realTimeData.isConnected || false
    const lastUpdated = realTimeData.lastUpdated
    
    const commonProps = {
      widgetId: widget.id,
      title: widget.title || widget.type,
      connected: isConnected,
      deviceInfo: null,
      lastUpdated: lastUpdated
    }

    console.log('🎨 Common props for widget:', commonProps)
    console.log('🎨 Real-time data for widget:', realTimeData)

    let renderedWidget
    switch (widget.type) {
      case 'gauge':
        const gaugeValue = realTimeData.data?.value || realTimeData.data || 50
        renderedWidget = <GaugeWidget 
          key={widget.id} 
          {...commonProps} 
          value={gaugeValue}
          min={widget.minValue || widget.min || 0}
          max={widget.maxValue || widget.max || 100}
          unit={widget.unit || '%'}
          color={widget.color || '#ef4444'}
          // CRITICAL: Pass MQTT topic for real-time updates
          topic={widget.mqttTopic}
          valuePath={widget.valuePath}
        />
        break
      case 'chart':
        const chartData = realTimeData.data || []
        renderedWidget = <ChartWidget 
          key={widget.id} 
          {...commonProps}
          chartType={widget.chartType || 'line'}
          color={widget.color || '#ef4444'}
          // CRITICAL: Pass MQTT topic for real-time ECharts updates
          topic={widget.mqttTopic}
          valuePath={widget.valuePath}
        />
        break
      case 'map':
        const mapDevices = realTimeData.data?.devices || realTimeData.data || []
        renderedWidget = <MapWidget key={widget.id} {...commonProps} devices={mapDevices} />
        break
      case 'notification':
        const notifications = realTimeData.data?.notifications || realTimeData.data || []
        renderedWidget = <NotificationWidget key={widget.id} {...commonProps} notifications={notifications} setNotifications={() => {}} />
        break
      case 'toggle':
        const toggleState = realTimeData.data?.isOn || realTimeData.data || false
        renderedWidget = <ToggleWidget key={widget.id} {...commonProps} isOn={toggleState} setIsOn={() => {}} />
        break
      case 'sensor':
      case 'sensor-tile':
        const sensorValue = realTimeData.data?.value || realTimeData.data || 25
        renderedWidget = <SimpleSensorWidget key={widget.id} {...commonProps} value={sensorValue} />
        break
      case 'slider':
        const sliderValue = realTimeData.data?.value || realTimeData.data || 50
        renderedWidget = <SliderWidget key={widget.id} {...commonProps} value={sliderValue} setValue={() => {}} />
        break
      case 'model3d':
      case '3d-model':
        const modelData = realTimeData.data || {}
        renderedWidget = <Model3DWidget key={widget.id} {...commonProps} data={modelData} />
        break
      default:
        renderedWidget = (
          <div key={widget.id} className="p-4 bg-gray-100 rounded-lg text-center text-gray-500">
            Unknown widget type: {widget.type}
          </div>
        )
    }
    
    console.log('🔍 Rendered widget:', renderedWidget)
    return renderedWidget
  }, [widgetData])

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

    console.log('🔍 Rendering dashboard with:', {
      widgetsCount: widgets.length,
      widgets: widgets,
      layouts: layouts,
      dashboardData: dashboardData
    })

    // Convert widgets to simple items for display (no complex positioning needed)
    const gridItems = widgets.map((widget, index) => {
      // Create a simple widget item for the new layout
      const simpleItem = {
        ...widget,
        i: widget.i || widget.id || `widget-${index}`, // Ensure unique ID
        id: widget.id || widget.i || `widget-${index}`,
        type: widget.type,
        title: widget.title || widget.type,
        // Keep original properties for widget rendering
        config: widget.config || {},
        data: widget.data || {},
        // Add index for display order
        displayIndex: index
      }
      console.log(`🔍 Converting widget ${widget.id} (index ${index}):`, {
        original: widget,
        simpleItem: simpleItem
      })
      return simpleItem
    })

    console.log('🔍 Grid items after conversion:', gridItems)
    console.log('🔍 Grid items count:', gridItems.length)

    // Use the simple grid items directly (no complex positioning needed)
    const displayItems = gridItems
    
    console.log('🔍 Display items:', displayItems)
    console.log('🔍 Display items count:', displayItems.length)
    console.log('🔍 Widget types:', displayItems.map(item => ({
      id: item.i,
      type: item.type,
      title: item.title,
      index: item.displayIndex
    })))

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Debug Info Toggle */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={() => setShowDebugInfo(!showDebugInfo)}
            className="bg-gray-800 text-white px-3 py-1 rounded text-xs hover:bg-gray-700"
          >
            {showDebugInfo ? 'Hide Debug' : 'Show Debug'}
          </button>
        </div>

        {/* Debug Info Panel */}
        {showDebugInfo && (
          <div className="absolute top-12 right-4 z-10 bg-black bg-opacity-90 text-white p-4 rounded-lg text-xs max-w-sm">
            <h3 className="font-bold mb-2">🔧 Debug Info</h3>
            <div className="space-y-1">
              <div>📡 MQTT Status: {connectionStatus.isConnected ? '✅ Connected' : '❌ Disconnected'}</div>
              <div>🔗 Panel ID: {panelId}</div>
              <div>🎯 Topic ID: {mqttTopic}</div>
              <div>📊 Original Widgets: {widgets.length}</div>
              <div>📊 Grid Items: {gridItems.length}</div>
              <div>📊 Display Items: {displayItems.length}</div>
              <div>🎯 Subscribed: {isSubscribed ? '✅ Yes' : '❌ No'}</div>
              <div>🚀 Simulation: {dataSimulator.getStatus().isRunning ? '✅ Running' : '❌ Stopped'}</div>
              <div>📈 Active Widgets: {dataSimulator.getStatus().activeWidgets.length}</div>
              <div>🔍 Active Subscriptions: {connectionStatus.subscriptions?.length || 0}</div>
            </div>
            <div className="mt-3 pt-2 border-t border-gray-600 space-y-2">
              <button
                onClick={() => runAllTests(panelId, dashboardData?.widgets || [])}
                className="w-full bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
              >
                🧪 Run Tests
              </button>
              <button
                onClick={() => {
                  console.log('📡 MQTT Explorer Instructions:')
                  console.log('1. Connect to: ws://test.mosquitto.org:8081')
                  console.log('2. Publish to topic:', mqttTopic)
                  console.log('3. Message format (use your actual widget IDs):')
                  
                  // Get actual widget IDs from dashboard data
                  const widgetIds = dashboardData?.widgets?.map(w => w.id) || []
                  const sampleMessage = {}
                  
                  widgetIds.forEach((widgetId, index) => {
                    if (index === 0) {
                      sampleMessage[widgetId] = {"value": 75, "unit": "%"}
                    } else {
                      sampleMessage[widgetId] = {"value": 30, "unit": "°C", "status": "normal"}
                    }
                  })
                  
                  console.log(JSON.stringify(sampleMessage, null, 2))
                  console.log('4. Your widget IDs:', widgetIds)
                  console.log('5. Your panel topic:', mqttTopic)
                }}
                className="w-full bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-xs"
              >
                📡 Show MQTT Instructions
              </button>
            </div>
          </div>
        )}

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
                {connectionStatus.isConnected ? (
                  <div className="flex items-center text-green-600">
                    <Wifi className="w-4 h-4 mr-1" />
                    <span className="text-sm">Live Data</span>
                  </div>
                ) : (
                  <div className="flex items-center text-gray-400">
                    <WifiOff className="w-4 h-4 mr-1" />
                    <span className="text-sm">Offline</span>
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
          {displayItems.length > 0 ? (
            <div className="space-y-6">
              {/* Debug: Show widget count */}
              <div className="mb-4 p-3 bg-blue-100 rounded-lg text-sm">
                <strong>Dashboard Status:</strong> Displaying {displayItems.length} widgets
              </div>
              
              {/* Simple responsive grid that works reliably */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayItems.map((widget, index) => (
                  <div 
                    key={widget.i || widget.id || index} 
                    className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-200"
                    style={{ minHeight: '300px' }}
                  >
                    {/* Widget Header */}
                    <div className="p-4 border-b border-gray-100 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 capitalize">
                          {widget.type}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-gray-500">Live</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Widget Content */}
                    <div className="p-4 flex-1">
                      {renderWidget(widget)}
                    </div>
                    
                    {/* Widget Footer */}
                    <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>ID: {widget.i || widget.id}</span>
                        <span>Widget {index + 1}</span>
                      </div>
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
