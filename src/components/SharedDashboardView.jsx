import React, { useState, useEffect, useCallback } from 'react'
import { Lock, Eye, Copy, Check } from 'lucide-react'
import { EnhancedGridLayout } from './grid/EnhancedGridLayout'
import { Button } from './ui/button'
import { GaugeWidget } from './widgets/gauge-widget'
import { ChartWidget } from './widgets/chart-widget'
import { MapWidget } from './widgets/map-widget'
import { NotificationWidget } from './widgets/notification-widget'
import { ToggleWidget } from './widgets/toggle-widget'
import { SimpleSensorWidget } from './widgets/simple-sensor-widget'
import { SliderWidget } from './widgets/slider-widget'
import { Model3DWidget } from './widgets/model3d-widget'

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
    switch (widget.type) {
      case 'gauge':
        return (
          <GaugeWidget
            value={widget.value || 50}
            max={widget.max || 100}
            min={widget.min || 0}
            label={widget.title || 'Gauge'}
            color={widget.color || 'primary'}
            size="small"
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
  }, [])

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
            <Lock className="w-12 h-12 text-blue-600 mx-auto mb-4" />
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
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              Access Dashboard
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Dashboard: {dashboardData?.title}</span>
              <button
                onClick={copyLink}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
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
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-green-600" />
                <h1 className="text-2xl font-bold text-gray-900">
                  {dashboardData.title}
                </h1>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
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
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-6">
          <EnhancedGridLayout
            widgets={dashboardData.widgets || []}
            layouts={dashboardData.layouts || {}}
            overlaps={[]}
            isValidating={false}
            renderWidget={renderWidget}
            isPreviewMode={true} // Always in preview mode for shared view
            onLayoutChange={() => {}} // Disabled for shared view
            onWidgetDelete={() => {}} // Disabled for shared view
            onWidgetCopy={() => {}} // Disabled for shared view
            onWidgetAdd={() => {}} // Disabled for shared view
            onWidgetSettings={() => {}} // Disabled for shared view
            showGridBackground={false}
            showStatusBar={false}
            enableAutoFix={false}
            className="h-[calc(100vh-120px)]"
          />
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-gray-200 px-6 py-2">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
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
