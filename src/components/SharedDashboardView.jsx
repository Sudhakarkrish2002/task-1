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
import './SharedDashboardView.css'

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

  // Load dashboard data
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setIsLoading(true)
        
        // Try to get from localStorage first (for demo)
        const storedData = localStorage.getItem(`published-${panelId}`)
        if (storedData) {
          const data = JSON.parse(storedData)
          console.log('🔍 SharedDashboardView - Loaded data:', data)
          console.log('🔍 Widgets count:', data.widgets?.length || 0)
          console.log('🔍 Layouts:', data.layouts)
          console.log('🔍 Widgets data:', data.widgets)
          setDashboardData(data)
          setIsLoading(false)
          return
        }

        // If not found in localStorage, show error
        setError('Dashboard not found or has expired')
        setIsLoading(false)
      } catch (err) {
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

  // Widget renderer function for shared view
  const renderWidget = useCallback((widget) => {
    const commonProps = {
      widgetId: widget.i || widget.id,
      panelId: 'shared',
      autoGenerate: true
    }

    switch (widget.type) {
      case 'gauge':
        return (
          <GaugeWidget
            {...commonProps}
            title={widget.title || 'Gauge'}
            min={widget.minValue || 0}
            max={widget.maxValue || 100}
            unit={widget.unit || '%'}
            color={widget.color || '#ef4444'}
          />
        )
      case 'chart':
        return (
          <ChartWidget
            {...commonProps}
            title={widget.title || 'Chart'}
            chartType={widget.chartType || 'bar'}
            color={widget.color || '#ef4444'}
          />
        )
      case 'map':
        return (
          <MapWidget
            {...commonProps}
            title={widget.title || 'Device Map'}
            center={widget.center || [37.7749, -122.4194]}
            zoom={widget.zoom || 10}
          />
        )
      case 'notification':
        return (
          <NotificationWidget
            {...commonProps}
            title={widget.title || 'Notifications'}
          />
        )
      case 'toggle':
        return (
          <ToggleWidget
            {...commonProps}
            title={widget.title || 'Toggle'}
          />
        )
      case 'sensor-tile':
        return (
          <SimpleSensorWidget
            {...commonProps}
            title={widget.title || 'Sensor'}
            unit={widget.unit || '°C'}
            min={widget.minValue || 0}
            max={widget.maxValue || 100}
          />
        )
      case 'slider':
        return (
          <SliderWidget
            {...commonProps}
            title={widget.title || 'Slider'}
            min={widget.minValue || 0}
            max={widget.maxValue || 100}
            unit={widget.unit || ''}
            color={widget.color || '#ef4444'}
          />
        )
      case '3d-model':
        return (
          <Model3DWidget
            {...commonProps}
            title={widget.title || '3D Model'}
            modelType={widget.modelType || 'cube'}
            color={widget.color || '#3b82f6'}
          />
        )
      default:
        return (
          <div className="w-full h-full bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">{widget.type || 'Widget'}</span>
          </div>
        )
    }
  }, [])

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
          <Button onClick={() => window.location.href = '/'}>
            Go to Home
          </Button>
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
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Dashboard: {dashboardData?.title}</span>
              <button
                onClick={copyLink}
                className="flex items-center space-x-1 text-red-600 hover:text-red-700"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Authenticated view - Read-only dashboard
  if (isAuthenticated && dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50" style={{ height: 'auto' }}>
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-green-600" />
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {dashboardData.title}
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-600">
                <span>Widgets: {dashboardData.stats?.totalWidgets || 0}</span>
                <span>•</span>
                <span>Shared Dashboard</span>
                <span>•</span>
                <span className="text-green-600 font-medium">View Only</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                onClick={copyLink}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy Link'}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-4 sm:p-6" style={{ paddingBottom: '20px' }}>
          {(() => {
            console.log('🔍 Rendering Shared Dashboard with:')
            console.log('🔍 Widgets:', dashboardData.widgets || [])
            console.log('🔍 Widget count:', (dashboardData.widgets || []).length)
            
            // Process widgets for display
            const rawWidgets = dashboardData.widgets || []
            const processedWidgets = rawWidgets.map((widget, index) => ({
              ...widget,
              i: widget.i || widget.id || `widget-${index}`,
              x: Math.max(0, widget.x || 0),
              y: Math.max(0, widget.y || 0),
              w: Math.max(1, widget.w || 3),
              h: Math.max(1, widget.h || 2)
            }))
            
            console.log('🔍 Processed widgets:', processedWidgets)
            
            return null
          })()}
          
          {/* Custom Grid Layout for Shared Dashboard */}
          <div className="shared-dashboard-grid">
            {(() => {
              const widgets = dashboardData.widgets || []
              const processedWidgets = widgets.map((widget, index) => ({
                ...widget,
                i: widget.i || widget.id || `widget-${index}`,
                x: Math.max(0, widget.x || 0),
                y: Math.max(0, widget.y || 0),
                w: Math.max(1, widget.w || 3),
                h: Math.max(1, widget.h || 2)
              }))
              
              // Calculate grid dimensions
              const maxY = Math.max(...processedWidgets.map(w => (w.y || 0) + (w.h || 1)), 0)
              const gridHeight = Math.max(maxY * 96 + 100, 400) // 96px per row (80px + 16px margin)
              
              return (
                <div 
                  className="relative w-full"
                  style={{ 
                    height: `${gridHeight}px`,
                    minHeight: '400px'
                  }}
                >
                  {processedWidgets.map((widget) => {
                    const left = widget.x * 96 // 96px per column (80px + 16px margin)
                    const top = widget.y * 96
                    const width = widget.w * 96 - 16 // Subtract margin
                    const height = widget.h * 96 - 16 // Subtract margin
                    
                    return (
                      <div
                        key={widget.i}
                        className="widget-container"
                        style={{
                          left: `${left}px`,
                          top: `${top}px`,
                          width: `${width}px`,
                          height: `${height}px`,
                          zIndex: 1
                        }}
                      >
                        <div className="widget-content">
                          {renderWidget(widget)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })()}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-gray-200 px-4 sm:px-6 py-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 text-xs sm:text-sm text-gray-600">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <span>Published: {new Date(dashboardData.publishedAt).toLocaleDateString()}</span>
              <span>•</span>
              <span>Panel ID: {dashboardData.panelId}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Connected</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default SharedDashboardView
