import React, { useState, useCallback, useRef } from 'react'
import { Responsive, WidthProvider } from 'react-grid-layout'
import { AlertTriangle, CheckCircle, RotateCcw, Maximize2, Minimize2, Trash2, Copy, ChevronDown, Settings } from 'lucide-react'
import { getGridLayoutProps } from '../../lib/gridUtils'

const ResponsiveGridLayout = WidthProvider(Responsive)

/**
 * Enhanced Grid Layout Component with advanced drag-and-drop and overlap prevention
 * @param {Object} props - Component props
 * @param {Array} props.initialWidgets - Initial widgets array
 * @param {Function} props.renderWidget - Function to render individual widgets
 * @param {boolean} props.isPreviewMode - Whether in preview mode
 * @param {Function} props.onLayoutChange - Layout change callback
 * @param {Function} props.onWidgetSelect - Widget selection callback
 * @param {Object} props.selectedWidget - Currently selected widget
 * @param {boolean} props.showGridBackground - Show grid background
 * @param {boolean} props.showStatusBar - Show status bar with overlap info
 * @param {boolean} props.enableAutoFix - Enable automatic overlap fixing
 * @param {Object} props.className - Additional CSS classes
 * @param {Object} props.style - Additional styles
 */

export const EnhancedGridLayout = ({
  widgets = [],
  layouts = {},
  overlaps = [],
  isValidating = false,
  renderWidget,
  isPreviewMode = false,
  onLayoutChange,
  showGridBackground = true,
  showStatusBar = true,
  enableAutoFix = true,
  onWidgetDelete,
  onWidgetCopy,
  onWidgetAdd,
  onWidgetSettings,
  className = '',
  style = {},
  ...props
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const gridRef = useRef(null)
  const containerRef = useRef(null)

  // Handle layout changes
  const handleLayoutChangeInternal = useCallback((layout, layouts) => {
    if (onLayoutChange) {
      onLayoutChange(layout, layouts)
    }
  }, [onLayoutChange])


  // Handle widget delete
  const handleWidgetDelete = useCallback((widgetId, event) => {
    event.stopPropagation()
    if (onWidgetDelete) {
      onWidgetDelete(widgetId)
    }
  }, [onWidgetDelete])

  // Handle widget copy
  const handleWidgetCopy = useCallback((widgetId, event) => {
    event.stopPropagation()
    if (onWidgetCopy) {
      onWidgetCopy(widgetId)
    }
  }, [onWidgetCopy])

  // Toggle fullscreen mode
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev)
  }, [])

  // Scroll to bottom function
  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [])

  // Check if scroll button should be shown
  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current
      setShowScrollButton(scrollHeight > clientHeight && scrollTop < scrollHeight - clientHeight - 100)
    }
  }, [])

  // Calculate basic grid statistics
  const gridStats = {
    totalWidgets: widgets.length,
    gridUtilization: widgets.length > 0 ? (widgets.reduce((acc, w) => acc + (w.w * w.h), 0) / (12 * 200)) * 100 : 0
  }

  // Drag and drop handlers
  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Set drop effect
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy'
    }
    
    setIsDragOver(true)
  }, [])

  const handleDragEnter = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Only set drag over to false if we're leaving the container entirely
    const relatedTarget = e.relatedTarget
    if (!containerRef.current?.contains(relatedTarget)) {
      setIsDragOver(false)
    }
  }, [])

  const handleDrop = useCallback((e) => {
    setIsDragOver(false)
    
    // Get widget type from global variable
    const widgetType = window.draggedWidgetType
    
    if (widgetType && onWidgetAdd) {
      onWidgetAdd(widgetType)
      // Clear the global variable
      window.draggedWidgetType = null
    }
  }, [onWidgetAdd])

  // Grid layout props
  const gridProps = {
    ...getGridLayoutProps(isPreviewMode),
    ...props
  }

  // Determine if this is a dashboard view
  const isDashboardView = className.includes('dashboard-view')
  
  return (
    <div 
      className={`enhanced-grid-layout relative ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''} ${className}`}
      style={style}
    >
      {/* Status Bar */}
      {showStatusBar && (
        <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {overlaps.length > 0 ? (
                <div className="flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-600 rounded-lg">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">{overlaps.length} Overlap{overlaps.length > 1 ? 's' : ''}</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-600 rounded-lg">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">No Overlaps</span>
                </div>
              )}
              
              {isValidating && (
                <div className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-600 rounded-lg">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-medium">Validating</span>
                </div>
              )}
            </div>
            
            <div className="text-sm text-gray-600">
              Widgets: {gridStats.totalWidgets} • Utilization: {gridStats.gridUtilization.toFixed(1)}%
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {overlaps.length > 0 && enableAutoFix && (
              <div className="flex items-center px-3 py-1 bg-orange-100 text-orange-600 rounded-lg text-sm">
                <RotateCcw className="w-4 h-4 mr-1" />
                Overlaps Detected
              </div>
            )}
            
            <button
              onClick={toggleFullscreen}
              className="flex items-center px-3 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* Drag Over Indicator */}
      {isDragOver && (
        <div className="absolute inset-0 bg-red-50 border-2 border-dashed border-red-400 z-10 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-lg font-semibold text-red-700">Drop widget here</p>
            <p className="text-sm text-red-600 mt-1">Release to add widget to dashboard</p>
          </div>
        </div>
      )}

      {/* Grid Container */}
      <div 
        ref={containerRef}
        className={`relative flex-1 ${isDashboardView ? 'overflow-visible' : 'overflow-auto'}`}
        style={{ 
          minHeight: isDashboardView ? 'auto' : '400px', 
          height: isDashboardView ? 'auto' : '100%' 
        }}
        onScroll={isDashboardView ? undefined : handleScroll}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Grid Background */}
        {showGridBackground && !isPreviewMode && (
          <div 
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
              `,
              backgroundSize: 'calc(100% / 12) 60px',
              backgroundPosition: '12px 12px'
            }}
          />
        )}

        {/* React Grid Layout */}
        <ResponsiveGridLayout
          ref={gridRef}
          {...gridProps}
          layouts={layouts}
          onLayoutChange={handleLayoutChangeInternal}
          onDrop={handleDrop}
        >
          {widgets.map(widget => {
            return (
              <div 
                key={widget.i} 
                data-grid={widget}
                className="grid-item group relative"
              >
              <div className="w-full h-full overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 relative">
                <div className="absolute inset-0 overflow-hidden">
                  {renderWidget ? renderWidget(widget) : (
                    <div className="w-full h-full bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <span className="text-gray-500 block">{widget.type || 'Widget'}</span>
                        <span className="text-xs text-gray-400 block mt-1">ID: {widget.i}</span>
                        <span className="text-xs text-gray-400 block">Pos: {widget.x},{widget.y}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Widget Control Buttons - Show on hover or when selected */}
                {!isPreviewMode && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1">
                    {onWidgetSettings && (
                      <button
                        onClick={(e) => onWidgetSettings(widget, e)}
                        className="p-1.5 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors duration-200 shadow-sm"
                        title="Widget Settings"
                      >
                        <Settings className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleWidgetCopy(widget.i, e)}
                      className="p-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 shadow-sm"
                      title="Copy widget"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => handleWidgetDelete(widget.i, e)}
                      className="p-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 shadow-sm"
                      title="Delete widget"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            )
          })}
        </ResponsiveGridLayout>

        {/* Empty State */}
        {widgets.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-4">📊</div>
              <p className="text-lg text-gray-600">No widgets added yet</p>
              <p className="text-sm text-gray-500 mt-2">
                Add widgets to start building your dashboard
              </p>
            </div>
          </div>
        )}

        {/* Scroll to Bottom Button - Only show in create mode, not dashboard view */}
        {showScrollButton && widgets.length > 0 && !isDashboardView && (
          <button
            onClick={scrollToBottom}
            className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 flex items-center space-x-2"
            title="Scroll to bottom to see all widgets"
          >
            <ChevronDown className="w-5 h-5" />
            <span className="text-sm font-medium">View All Widgets</span>
          </button>
        )}
        
      </div>
    </div>
  )
}

export default EnhancedGridLayout
