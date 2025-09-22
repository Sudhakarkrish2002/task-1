import React, { useState, useEffect, useCallback } from 'react'
import { Lock, Eye, Copy, Check } from 'lucide-react'
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
  const { isMobile, isTablet, isDesktop } = useDeviceType()

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
    const baseWidth = Math.max(3, Math.floor((widget.w || 4) * 0.85))
    const baseHeight = Math.max(3, Math.floor((widget.h || 3) * 0.85))
    
    return {
      w: baseWidth,
      h: baseHeight,
      minW: 3,
      minH: 3,
      // Responsive dimensions for different breakpoints
      lg: { w: baseWidth, h: baseHeight },
      md: { w: Math.min(8, Math.max(3, Math.ceil(baseWidth * 0.8))), h: Math.max(3, Math.ceil(baseHeight * 0.9)) },
      sm: { w: Math.min(6, Math.max(3, Math.ceil(baseWidth * 0.7))), h: Math.max(3, Math.ceil(baseHeight * 0.8)) },
      xs: { w: 3, h: Math.max(3, Math.ceil(baseHeight * 0.7)) },
      xxs: { w: 2, h: Math.max(3, Math.ceil(baseHeight * 0.6)) }
    }
  }, [])

  // Render widget based on type
  const renderWidget = useCallback((widget) => {
    console.log('🔍 Rendering widget:', widget)
    
    const commonProps = {
      widgetId: widget.id,
      title: widget.title || widget.type,
      connected: false,
      deviceInfo: null
    }

    console.log('🔍 Common props for widget:', commonProps)

    let renderedWidget
    switch (widget.type) {
      case 'gauge':
        renderedWidget = <GaugeWidget key={widget.id} {...commonProps} value={50} />
        break
      case 'chart':
        renderedWidget = <ChartWidget key={widget.id} {...commonProps} autoGenerate={true} />
        break
      case 'map':
        renderedWidget = <MapWidget key={widget.id} {...commonProps} devices={[]} />
        break
      case 'notification':
        renderedWidget = <NotificationWidget key={widget.id} {...commonProps} notifications={[]} setNotifications={() => {}} />
        break
      case 'toggle':
        renderedWidget = <ToggleWidget key={widget.id} {...commonProps} isOn={false} setIsOn={() => {}} />
        break
      case 'sensor':
      case 'sensor-tile':
        renderedWidget = <SimpleSensorWidget key={widget.id} {...commonProps} value={25} />
        break
      case 'slider':
        renderedWidget = <SliderWidget key={widget.id} {...commonProps} value={50} setValue={() => {}} />
        break
      case 'model3d':
      case '3d-model':
        renderedWidget = <Model3DWidget key={widget.id} {...commonProps} />
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
  }, [])

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

    // Convert widgets to grid items with responsive dimensions
    const gridItems = widgets.map(widget => {
      const dimensions = calculateWidgetDimensions(widget)
      return {
        ...widget,
        ...dimensions,
        i: widget.i || widget.id, // Ensure 'i' property exists for grid layout
        x: widget.x || 0,
        y: widget.y || 0
      }
    })

    console.log('🔍 Grid items after conversion:', gridItems)

    // Auto-fix overlaps for better layout
    const fixedItems = autoFixOverlaps(gridItems, { cols: 12, rowHeight: 80 })
    
    console.log('🔍 Fixed items after overlap fix:', fixedItems)

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

        {/* Responsive Grid Layout for Shared Dashboard */}
        <div className="shared-dashboard-grid">
          {fixedItems.length > 0 ? (
            <EnhancedGridLayout
              className="layout"
              widgets={fixedItems}
              layouts={{ lg: fixedItems }}
              breakpoints={gridConfig.breakpoints}
              cols={gridConfig.cols}
              rowHeight={gridConfig.rowHeight}
              margin={gridConfig.margin}
              containerPadding={gridConfig.containerPadding}
              isDraggable={false}
              isResizable={false}
              isBounded={true}
              preventCollision={true}
              useCSSTransforms={true}
              compactType="vertical"
              renderWidget={renderWidget}
              isPreviewMode={true}
              showGridBackground={false}
              showStatusBar={false}
            />
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
                  <p>Fixed items: {fixedItems.length}</p>
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
