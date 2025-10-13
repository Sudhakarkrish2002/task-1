import React, { useState, useCallback, useRef } from 'react'
import { Responsive, WidthProvider } from 'react-grid-layout'
import { AlertTriangle, CheckCircle, RotateCcw, Maximize2, Minimize2, Trash2, Copy, ChevronDown, Settings } from 'lucide-react'
import { getGridLayoutProps } from '../../lib/gridUtils'
import { 
  handleProfessionalDrop, 
  createDropZone, 
  createDropIndicator,
  getWidgetSize,
  handleSmartCollision,
  animateWidgetMovement,
  batchAnimateWidgets,
  handleEnhancedDragOver
} from '../../lib/dragDropUtils'

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
  const [dropIndicator, setDropIndicator] = useState(null)
  const [dragPosition, setDragPosition] = useState(null)
  const [collidingWidgets, setCollidingWidgets] = useState([])
  const [isAnimating, setIsAnimating] = useState(false)
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

  // Professional drop handler with smart collision handling
  const handleDrop = useCallback((event) => {
    console.log('Professional drop event triggered:', event)
    
    // Get widget type and calculate position
    const widgetType = event.dataTransfer.getData('text/plain') || window.draggedWidgetType
    if (!widgetType || !onWidgetAdd) return
    
    const widgetSize = getWidgetSize(widgetType)
    const rect = event.currentTarget.getBoundingClientRect()
    const dropData = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    }
    
    // Convert to grid coordinates
    // rowHeight = 80, margin = [16, 16], so total cell size = 96
    const cellSize = 96 // 80 + 16
    const gridX = Math.floor(dropData.x / cellSize)
    const gridY = Math.floor(dropData.y / cellSize)
    const dropPosition = {
      x: Math.max(0, Math.min(gridX, 12 - widgetSize.w)),
      y: Math.max(0, gridY)
    }
    
    // Handle smart collision if there are colliding widgets
    if (collidingWidgets.length > 0) {
      setIsAnimating(true)
      
      // Prepare batch animations for better performance
      const animations = collidingWidgets.map((widget, index) => {
        const element = document.querySelector(`[data-grid="${widget.i}"]`)
        if (element) {
          // Calculate new position (push right or down)
          const newPosition = {
            x: Math.min(widget.x + widgetSize.w, 12 - widget.w),
            y: widget.y
          }
          
          // If pushing right would go out of bounds, push down instead
          if (newPosition.x + widget.w > 12) {
            newPosition.x = widget.x
            newPosition.y = widget.y + widgetSize.h + 1
          }
          
          return {
            element,
            fromPosition: { x: widget.x * 96, y: widget.y * 96 },
            toPosition: { x: newPosition.x * 96, y: newPosition.y * 96 }
          }
        }
        return null
      }).filter(Boolean)
      
      // Execute batch animations
      batchAnimateWidgets(animations, () => {
        setIsAnimating(false)
      })
    }
    
    // Add the new widget
    onWidgetAdd(widgetType, { position: dropPosition })
    
    // Clear visual feedback
    setIsDragOver(false)
    setDropIndicator(null)
    setDragPosition(null)
    setCollidingWidgets([])
    
    // Reset all widget visual feedback
    widgets.forEach(widget => {
      const element = document.querySelector(`[data-grid="${widget.i}"]`)
      if (element) {
        element.style.transition = 'all 200ms ease'
        element.style.transform = 'scale(1)'
        element.style.opacity = '1'
        element.style.border = ''
      }
    })
  }, [widgets, onWidgetAdd, collidingWidgets])

  // Optimized drag over handler with throttling and performance improvements
  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy'
    }
    
    setIsDragOver(true)
    
    // Throttle the expensive operations
    if (window.dragOverThrottle) {
      clearTimeout(window.dragOverThrottle)
    }
    
    window.dragOverThrottle = setTimeout(() => {
      // Calculate drop position for visual feedback
      if (!e.currentTarget) return
      
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      setDragPosition({ x, y })
      
      // Create drop indicator if we have a widget type
      const widgetType = window.draggedWidgetType
      if (widgetType) {
        const widgetSize = getWidgetSize(widgetType)
        const cellSize = 96 // 80 + 16 margin
        const gridX = Math.floor(x / cellSize)
        const gridY = Math.floor(y / cellSize)
        
        const dropPosition = {
          x: Math.max(0, Math.min(gridX, 12 - widgetSize.w)),
          y: Math.max(0, gridY),
          w: widgetSize.w,
          h: widgetSize.h
        }
        
        setDropIndicator(dropPosition)
        
        // Optimized collision detection - only check if position changed significantly
        const currentCollidingWidgets = widgets.filter(widget => {
          const widgetRight = widget.x + widget.w
          const widgetBottom = widget.y + widget.h
          const newRight = dropPosition.x + widgetSize.w
          const newBottom = dropPosition.y + widgetSize.h
          
          // Check for overlap - widgets overlap if they intersect in both x and y axes
          const overlapX = !(newRight <= widget.x || widgetRight <= dropPosition.x)
          const overlapY = !(newBottom <= widget.y || widgetBottom <= dropPosition.y)
          
          return overlapX && overlapY
        })
        
        // Only update if collision state changed
        if (JSON.stringify(currentCollidingWidgets.map(w => w.i)) !== JSON.stringify(collidingWidgets.map(w => w.i))) {
          setCollidingWidgets(currentCollidingWidgets)
          
          // Batch DOM updates for better performance
          const elementsToUpdate = new Map()
          
          // Collect all elements that need updates
          currentCollidingWidgets.forEach(widget => {
            const element = document.querySelector(`[data-grid="${widget.i}"]`)
            if (element) {
              elementsToUpdate.set(element, { type: 'collision', widget })
            }
          })
          
          widgets.filter(w => !currentCollidingWidgets.includes(w)).forEach(widget => {
            const element = document.querySelector(`[data-grid="${widget.i}"]`)
            if (element && !element.classList.contains('dragging')) {
              elementsToUpdate.set(element, { type: 'reset', widget })
            }
          })
          
          // Apply all updates in a single batch
          elementsToUpdate.forEach((update, element) => {
            if (update.type === 'collision') {
              element.style.transition = 'all 150ms ease'
              element.style.transform = 'scale(0.95)'
              element.style.opacity = '0.8'
              element.style.border = '2px dashed #ef4444'
            } else {
              element.style.transition = 'all 150ms ease'
              element.style.transform = 'scale(1)'
              element.style.opacity = '1'
              element.style.border = ''
            }
          })
        }
      }
    }, 16) // ~60fps throttling
  }, [widgets, collidingWidgets])

  const handleDragLeave = useCallback((e) => {
    if (!containerRef.current?.contains(e.relatedTarget)) {
      setIsDragOver(false)
      setDropIndicator(null)
      setDragPosition(null)
      setCollidingWidgets([])
      
      // Reset all widget visual feedback
      widgets.forEach(widget => {
        const element = document.querySelector(`[data-grid="${widget.i}"]`)
        if (element && !element.classList.contains('dragging')) {
          element.style.transition = 'all 200ms ease'
          element.style.transform = 'scale(1)'
          element.style.opacity = '1'
          element.style.border = ''
        }
      })
    }
  }, [widgets])

  // Determine if this is a dashboard view
  const isDashboardView = className.includes('dashboard-view')

  // Grid layout props with enhanced overlap prevention
  const gridProps = {
    ...getGridLayoutProps(isPreviewMode),
    ...props,
    // Enhanced overlap prevention for dashboard view
    preventCollision: true,
    compactType: 'vertical',
    allowOverlap: false,
    isBounded: isDashboardView ? false : true, // Allow unbounded growth in dashboard view
    autoSize: isDashboardView ? false : true, // Disable autoSize in dashboard view for better control
    useCSSTransforms: true,
    transformScale: 1
  }
  
  return (
    <div 
      className={`enhanced-grid-layout relative ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''} ${className} ${isDragOver ? 'drag-over' : ''}`}
      style={style}
      ref={containerRef}
      onScroll={handleScroll}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* Status Bar - Only show in edit mode, not in dashboard view */}
      {showStatusBar && !isDashboardView && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-gray-50 border-b border-gray-200 gap-3 sm:gap-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex flex-wrap items-center gap-2">
              {overlaps.length > 0 ? (
                <div className="flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-600 rounded-lg">
                  <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm font-medium">{overlaps.length} Overlap{overlaps.length > 1 ? 's' : ''}</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-600 rounded-lg">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm font-medium">No Overlaps</span>
                </div>
              )}
              
              {isValidating && (
                <div className="flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-600 rounded-lg">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs sm:text-sm font-medium">Validating</span>
                </div>
              )}
            </div>
            
            <div className="text-xs sm:text-sm text-gray-600">
              Widgets: {gridStats.totalWidgets} • Utilization: {gridStats.gridUtilization.toFixed(1)}%
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {overlaps.length > 0 && enableAutoFix && (
              <div className="flex items-center px-2 sm:px-3 py-1 bg-orange-100 text-orange-600 rounded-lg text-xs sm:text-sm">
                <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="hidden sm:inline">Overlaps Detected</span>
                <span className="sm:hidden">Overlaps</span>
              </div>
            )}
            
            <button
              onClick={toggleFullscreen}
              className="flex items-center px-2 sm:px-3 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-xs sm:text-sm"
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-3 h-3 sm:w-4 sm:h-4" /> : <Maximize2 className="w-3 h-3 sm:w-4 sm:h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* Drag Over Indicator - Only show when no widgets exist */}
      {isDragOver && widgets.length === 0 && (
        <div className="absolute inset-0 bg-red-50 border-2 border-dashed border-red-400 z-10 flex items-center justify-center">
          <div className="text-center px-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 animate-pulse">
              <span className="text-xl sm:text-2xl">📊</span>
            </div>
            <p className="text-base sm:text-lg font-semibold text-red-700">Drop widget here</p>
            <p className="text-xs sm:text-sm text-red-600 mt-1">Release to add widget to dashboard</p>
            {window.draggedWidgetType && (
              <p className="text-xs text-red-500 mt-2">Widget: {window.draggedWidgetType}</p>
            )}
          </div>
        </div>
      )}

      {/* Drag Over Indicator for existing widgets - Show subtle border only */}
      {isDragOver && widgets.length > 0 && (
        <div className="absolute inset-0 border-2 border-dashed border-red-400 pointer-events-none" style={{ zIndex: 1 }}>
          <div className="absolute top-4 left-4 bg-red-100 text-red-700 px-3 py-1 rounded-lg text-sm font-medium shadow-lg">
            Drop widget here
          </div>
        </div>
      )}

      {/* Grid Container */}
      <div 
        ref={containerRef}
        className={`relative flex-1 ${isDashboardView ? 'overflow-visible' : 'overflow-auto'}`}
        style={{ 
          minHeight: isDashboardView ? '600px' : '400px', 
          height: isDashboardView ? 'auto' : '100%',
          maxHeight: isDashboardView ? 'none' : '100%',
          width: '100%',
          position: 'relative'
        }}
        onScroll={isDashboardView ? undefined : handleScroll}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {/* Grid Background */}
        {showGridBackground && !isPreviewMode && (
          <div 
            className="absolute inset-0 pointer-events-none grid-background"
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

        {/* Drop Indicator */}
        {dropIndicator && isDragOver && (
          <div
            className="absolute pointer-events-none drop-indicator z-20"
            style={createDropIndicator(dropIndicator, { w: dropIndicator.w, h: dropIndicator.h }, {
              rowHeight: 80,
              margin: [16, 16]
            })}
          />
        )}

        {/* Empty state message */}
        {widgets.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center empty-dashboard-state">
            <div className="text-center text-gray-500 empty-message rounded-lg p-4 sm:p-8">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">Empty Dashboard</p>
              <p className="text-xs sm:text-sm text-gray-500 max-w-sm">Drag widgets from the palette or click them to add to your dashboard</p>
            </div>
          </div>
        )}

        {/* React Grid Layout */}
        {(() => {
          // Debug: Log widget sizes to identify problematic widgets
          widgets.forEach(widget => {
            if (widget.minW >= widget.w || widget.minH >= widget.h) {
              console.error('🚨 INVALID WIDGET SIZING DETECTED:', {
                id: widget.i,
                type: widget.type,
                w: widget.w,
                h: widget.h,
                minW: widget.minW,
                minH: widget.minH,
                maxW: widget.maxW,
                maxH: widget.maxH
              })
            }
          })
          
          // Debug: Log layout items to identify problematic layout items
          Object.keys(layouts).forEach(breakpoint => {
            layouts[breakpoint].forEach(item => {
              if (item.minW >= item.w || item.minH >= item.h) {
                console.error('🚨 INVALID LAYOUT ITEM SIZING DETECTED:', {
                  breakpoint,
                  id: item.i,
                  w: item.w,
                  h: item.h,
                  minW: item.minW,
                  minH: item.minH,
                  maxW: item.maxW,
                  maxH: item.maxH
                })
              }
            })
          })
          
          return null
        })()}
        <ResponsiveGridLayout
          ref={gridRef}
          {...gridProps}
          layouts={layouts}
          onLayoutChange={handleLayoutChangeInternal}
          isDroppable={false}
        >
          {widgets.map(widget => {
            return (
              <div 
                key={widget.i} 
                data-grid={widget}
                className="grid-item group relative"
              >
              <div className="w-full h-full overflow-visible bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 relative">
                <div className="absolute inset-0 overflow-visible">
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
                
                {/* Widget Control Buttons - Show on hover or when selected, but not in dashboard view */}
                {!isPreviewMode && !isDashboardView && (
                  <div className="absolute top-2 right-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 flex space-x-1" style={{ zIndex: 100 }}>
                    {onWidgetSettings && (
                      <button
                        onClick={(e) => onWidgetSettings(widget, e)}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="p-2 sm:p-1.5 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors duration-200 shadow-sm cursor-pointer w-9 h-9 sm:w-auto sm:h-auto"
                        title="Widget Settings"
                      >
                        <Settings className="w-4 h-4 sm:w-3 sm:h-3" />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleWidgetCopy(widget.i, e)}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="p-2 sm:p-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 shadow-sm cursor-pointer w-9 h-9 sm:w-auto sm:h-auto"
                      title="Copy widget"
                    >
                      <Copy className="w-4 h-4 sm:w-3 sm:h-3" />
                    </button>
                    <button
                      onClick={(e) => handleWidgetDelete(widget.i, e)}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="p-2 sm:p-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 shadow-sm cursor-pointer w-9 h-9 sm:w-auto sm:h-auto"
                      title="Delete widget"
                    >
                      <Trash2 className="w-4 h-4 sm:w-3 sm:h-3" />
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
            <div className="text-center px-4">
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">📊</div>
              <p className="text-base sm:text-lg text-gray-600">No widgets added yet</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-2">
                Add widgets to start building your dashboard
              </p>
            </div>
          </div>
        )}

        {/* Scroll to Bottom Button - Only show in create mode, not dashboard view */}
        {showScrollButton && widgets.length > 0 && !isDashboardView && (
          <button
            onClick={scrollToBottom}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 bg-red-600 hover:bg-red-700 text-white p-2 sm:p-3 rounded-full shadow-lg transition-all duration-200 flex items-center space-x-1 sm:space-x-2"
            title="Scroll to bottom to see all widgets"
          >
            <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm font-medium hidden sm:inline">View All Widgets</span>
          </button>
        )}
        
      </div>
    </div>
  )
}

export default EnhancedGridLayout
