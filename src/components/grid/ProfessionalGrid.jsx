import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Trash2, Copy, Settings, Maximize2, Minimize2 } from 'lucide-react'

/**
 * Professional Grid Layout Component
 * Inspired by Blynk dashboard - clean, modern, and bug-free
 */
export const ProfessionalGrid = ({
  widgets = [],
  onWidgetAdd,
  onWidgetDelete,
  onWidgetCopy,
  onWidgetUpdate,
  onWidgetSettings,
  isPreviewMode = false,
  isMobile = false,
  isTablet = false,
  className = '',
  style = {}
}) => {
  const [selectedWidget, setSelectedWidget] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [draggedWidget, setDraggedWidget] = useState(null)
  const [dragOverPosition, setDragOverPosition] = useState(null)
  const [isDragOver, setIsDragOver] = useState(false)
  
  const gridRef = useRef(null)
  const dragCounterRef = useRef(0)

  // Grid configuration
  const GRID_CONFIG = {
    cols: 12,
    rowHeight: 80,
    margin: 16,
    minWidgetWidth: 2,
    minWidgetHeight: 2,
    maxWidgetWidth: 12,
    maxWidgetHeight: 10
  }

  // Calculate grid position from pixel coordinates
  const getGridPosition = useCallback((x, y) => {
    const cellSize = GRID_CONFIG.rowHeight + GRID_CONFIG.margin
    return {
      x: Math.floor(x / cellSize),
      y: Math.floor(y / cellSize)
    }
  }, [])

  // Check if position is available
  const isPositionAvailable = useCallback((x, y, w, h, excludeId = null) => {
    return !widgets.some(widget => {
      if (widget.id === excludeId) return false
      
      const widgetRight = widget.x + widget.w
      const widgetBottom = widget.y + widget.h
      const newRight = x + w
      const newBottom = y + h
      
      return !(x >= widgetRight || newRight <= widget.x || y >= widgetBottom || newBottom <= widget.y)
    })
  }, [widgets])

  // Find next available position
  const findAvailablePosition = useCallback((w, h) => {
    for (let y = 0; y < 20; y++) {
      for (let x = 0; x <= GRID_CONFIG.cols - w; x++) {
        if (isPositionAvailable(x, y, w, h)) {
          return { x, y }
        }
      }
    }
    return { x: 0, y: 20 }
  }, [isPositionAvailable])

  // Handle drag start
  const handleDragStart = useCallback((e, widgetType) => {
    setDraggedWidget(widgetType)
    e.dataTransfer.effectAllowed = 'copy'
    e.dataTransfer.setData('text/plain', widgetType)
  }, [])

  // Handle drag over
  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    
    if (draggedWidget) {
      const rect = gridRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const position = getGridPosition(x, y)
      
      setDragOverPosition(position)
      setIsDragOver(true)
    }
  }, [draggedWidget, getGridPosition])

  // Handle drag leave
  const handleDragLeave = useCallback((e) => {
    dragCounterRef.current--
    if (dragCounterRef.current === 0) {
      setIsDragOver(false)
      setDragOverPosition(null)
    }
  }, [])

  // Handle drag enter
  const handleDragEnter = useCallback((e) => {
    e.preventDefault()
    dragCounterRef.current++
  }, [])

  // Handle drop
  const handleDrop = useCallback((e) => {
    e.preventDefault()
    
    const widgetType = e.dataTransfer.getData('text/plain') || draggedWidget
    if (!widgetType || !onWidgetAdd) return

    const rect = gridRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const position = getGridPosition(x, y)

    // Get widget size
    const widgetSize = getWidgetSize(widgetType)
    
    // Ensure position is within bounds
    const finalX = Math.max(0, Math.min(position.x, GRID_CONFIG.cols - widgetSize.w))
    const finalY = Math.max(0, position.y)

    // Check if position is available, if not find next available
    const finalPosition = isPositionAvailable(finalX, finalY, widgetSize.w, widgetSize.h) 
      ? { x: finalX, y: finalY }
      : findAvailablePosition(widgetSize.w, widgetSize.h)

    onWidgetAdd(widgetType, finalPosition)
    
    // Clean up
    setDraggedWidget(null)
    setDragOverPosition(null)
    setIsDragOver(false)
    dragCounterRef.current = 0
  }, [draggedWidget, onWidgetAdd, getGridPosition, isPositionAvailable, findAvailablePosition])

  // Handle widget click
  const handleWidgetClick = useCallback((widget, e) => {
    e.stopPropagation()
    setSelectedWidget(widget.id === selectedWidget ? null : widget.id)
  }, [selectedWidget])

  // Handle widget delete
  const handleWidgetDelete = useCallback((widgetId, e) => {
    e.stopPropagation()
    if (onWidgetDelete) {
      onWidgetDelete(widgetId)
    }
    if (selectedWidget === widgetId) {
      setSelectedWidget(null)
    }
  }, [onWidgetDelete, selectedWidget])

  // Handle widget copy
  const handleWidgetCopy = useCallback((widgetId, e) => {
    e.stopPropagation()
    if (onWidgetCopy) {
      onWidgetCopy(widgetId)
    }
  }, [onWidgetCopy])

  // Handle widget settings
  const handleWidgetSettings = useCallback((widget, e) => {
    e.stopPropagation()
    if (onWidgetSettings) {
      onWidgetSettings(widget)
    }
  }, [onWidgetSettings])

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev)
  }, [])

  // Click outside to deselect
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!gridRef.current?.contains(e.target)) {
        setSelectedWidget(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div 
      className={`professional-grid ${isFullscreen ? 'fullscreen' : ''} ${className}`}
      style={style}
    >
      {/* Header */}
      {!isPreviewMode && (
        <div className="grid-header">
          <div className="grid-title">
            <h2>Dashboard</h2>
            <span className="widget-count">{widgets.length} widgets</span>
          </div>
          <div className="grid-actions">
            <button
              onClick={toggleFullscreen}
              className="action-btn"
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>
        </div>
      )}

      {/* Grid Container */}
      <div 
        ref={gridRef}
        className={`grid-container ${isDragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDragEnter={handleDragEnter}
        onDrop={handleDrop}
        style={{
          '--grid-cols': GRID_CONFIG.cols,
          '--row-height': `${GRID_CONFIG.rowHeight}px`,
          '--margin': `${GRID_CONFIG.margin}px`
        }}
      >
        {/* Grid Background */}
        {!isPreviewMode && (
          <div className="grid-background" />
        )}

        {/* Drop Indicator */}
        {isDragOver && dragOverPosition && draggedWidget && (
          <div 
            className="drop-indicator"
            style={{
              left: `${dragOverPosition.x * (GRID_CONFIG.rowHeight + GRID_CONFIG.margin)}px`,
              top: `${dragOverPosition.y * (GRID_CONFIG.rowHeight + GRID_CONFIG.margin)}px`,
              width: `${getWidgetSize(draggedWidget).w * (GRID_CONFIG.rowHeight + GRID_CONFIG.margin) - GRID_CONFIG.margin}px`,
              height: `${getWidgetSize(draggedWidget).h * (GRID_CONFIG.rowHeight + GRID_CONFIG.margin) - GRID_CONFIG.margin}px`
            }}
          />
        )}

        {/* Widgets */}
        {widgets.map(widget => (
          <div
            key={widget.id}
            className={`grid-widget ${selectedWidget === widget.id ? 'selected' : ''} ${isMobile ? 'mobile-widget' : ''}`}
            style={isMobile ? {
              // Mobile card layout - no absolute positioning
              position: 'relative',
              left: 'auto',
              top: 'auto',
              width: '100%',
              height: 'auto',
              minHeight: '120px',
              marginBottom: '16px'
            } : {
              // Desktop grid layout
              left: `${widget.x * (GRID_CONFIG.rowHeight + GRID_CONFIG.margin)}px`,
              top: `${widget.y * (GRID_CONFIG.rowHeight + GRID_CONFIG.margin)}px`,
              width: `${widget.w * (GRID_CONFIG.rowHeight + GRID_CONFIG.margin) - GRID_CONFIG.margin}px`,
              height: `${widget.h * (GRID_CONFIG.rowHeight + GRID_CONFIG.margin) - GRID_CONFIG.margin}px`
            }}
            onClick={(e) => handleWidgetClick(widget, e)}
          >
            <div className="widget-content">
              {widget.render ? widget.render(widget) : (
                <div className="widget-placeholder">
                  <span>{widget.type}</span>
                </div>
              )}
            </div>

            {/* Widget Controls */}
            {!isPreviewMode && selectedWidget === widget.id && (
              <div className="widget-controls">
                {onWidgetSettings && (
                  <button
                    onClick={(e) => handleWidgetSettings(widget, e)}
                    className="control-btn settings"
                    title="Settings"
                  >
                    <Settings size={14} />
                  </button>
                )}
                {onWidgetCopy && (
                  <button
                    onClick={(e) => handleWidgetCopy(widget.id, e)}
                    className="control-btn copy"
                    title="Copy"
                  >
                    <Copy size={14} />
                  </button>
                )}
                {onWidgetDelete && (
                  <button
                    onClick={(e) => handleWidgetDelete(widget.id, e)}
                    className="control-btn delete"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Empty State */}
        {widgets.length === 0 && (
          <div className="empty-state">
            <div className="empty-content">
              <div className="empty-icon">📊</div>
              <h3>No widgets yet</h3>
              <p>Click the + button to add widgets to your dashboard</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Widget size configuration
const getWidgetSize = (widgetType) => {
  const sizes = {
    'gauge': { w: 3, h: 3 },
    'chart': { w: 4, h: 4 },
    'toggle': { w: 3, h: 3 },
    'slider': { w: 3, h: 2 },
    'map': { w: 6, h: 5 },
    'notification': { w: 3, h: 4 },
    'sensor-tile': { w: 3, h: 3 },
    '3d-model': { w: 4, h: 5 }
  }
  return sizes[widgetType] || { w: 3, h: 3 }
}

export default ProfessionalGrid
