/**
 * Professional Drag and Drop Utilities
 * Enhanced positioning logic for better widget placement
 */

/**
 * Calculate the optimal position for a new widget based on drop coordinates
 * @param {Object} dropData - Drop event data
 * @param {Array} existingWidgets - Current widgets
 * @param {Object} widgetSize - Size of the widget to place
 * @param {Object} gridConfig - Grid configuration
 * @returns {Object} - Optimal position {x, y}
 */
export const calculateOptimalPosition = (dropData, existingWidgets, widgetSize, gridConfig = {}) => {
  const { cols = 12, rowHeight = 80, margin = [16, 16] } = gridConfig
  
  // If no widgets exist, place at top-left
  if (!existingWidgets || existingWidgets.length === 0) {
    return { x: 0, y: 0 }
  }
  
  // Convert drop coordinates to grid coordinates
  const gridX = Math.floor(dropData.x / (rowHeight + margin[0]))
  const gridY = Math.floor(dropData.y / (rowHeight + margin[1]))
  
  // Clamp to grid bounds
  const clampedX = Math.max(0, Math.min(gridX, cols - widgetSize.w))
  const clampedY = Math.max(0, gridY)
  
  console.log('Calculating position for widget:', widgetSize, 'at drop coords:', dropData, 'grid coords:', { x: clampedX, y: clampedY })
  console.log('Existing widgets:', existingWidgets)
  
  // Check if position is available
  if (isPositionAvailable(clampedX, clampedY, widgetSize, existingWidgets)) {
    console.log('Position is available, using:', { x: clampedX, y: clampedY })
    return { x: clampedX, y: clampedY }
  }
  
  // If position is occupied, find nearest available position
  console.log('Position is occupied, finding nearest available position')
  const nearestPosition = findNearestAvailablePosition(clampedX, clampedY, widgetSize, existingWidgets, cols)
  console.log('Nearest available position:', nearestPosition)
  return nearestPosition
}

/**
 * Check if a position is available for a widget
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {Object} size - Widget size {w, h}
 * @param {Array} existingWidgets - Current widgets
 * @returns {boolean} - Whether position is available
 */
export const isPositionAvailable = (x, y, size, existingWidgets) => {
  return !existingWidgets.some(widget => {
    const widgetRight = widget.x + widget.w
    const widgetBottom = widget.y + widget.h
    const newRight = x + size.w
    const newBottom = y + size.h
    
    return !(
      x >= widgetRight ||
      newRight <= widget.x ||
      y >= widgetBottom ||
      newBottom <= widget.y
    )
  })
}

/**
 * Find the nearest available position to the desired location
 * @param {number} desiredX - Desired X coordinate
 * @param {number} desiredY - Desired Y coordinate
 * @param {Object} size - Widget size
 * @param {Array} existingWidgets - Current widgets
 * @param {number} cols - Number of columns
 * @returns {Object} - Available position {x, y}
 */
export const findNearestAvailablePosition = (desiredX, desiredY, size, existingWidgets, cols = 12) => {
  const maxSearchRadius = 20 // Maximum search radius
  
  // Try positions in expanding circles around the desired position
  for (let radius = 0; radius <= maxSearchRadius; radius++) {
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        // Only check positions on the current radius circle
        if (Math.abs(dx) !== radius && Math.abs(dy) !== radius && radius > 0) {
          continue
        }
        
        const testX = desiredX + dx
        const testY = desiredY + dy
        
        // Check bounds
        if (testX < 0 || testX + size.w > cols || testY < 0) {
          continue
        }
        
        // Check if position is available
        if (isPositionAvailable(testX, testY, size, existingWidgets)) {
          return { x: testX, y: testY }
        }
      }
    }
  }
  
  // If no position found, place at the bottom
  const maxY = existingWidgets.length > 0 
    ? Math.max(...existingWidgets.map(w => w.y + w.h)) 
    : 0
  
  return { x: 0, y: maxY + 1 }
}

/**
 * Enhanced drop handler with professional positioning
 * @param {Object} event - Drop event
 * @param {Array} existingWidgets - Current widgets
 * @param {Function} onWidgetAdd - Widget add callback
 * @param {Object} gridConfig - Grid configuration
 */
export const handleProfessionalDrop = (event, existingWidgets, onWidgetAdd, gridConfig = {}) => {
  event.preventDefault()
  
  // Get widget type from drag data
  const widgetType = event.dataTransfer.getData('text/plain') || window.draggedWidgetType
  
  if (!widgetType || !onWidgetAdd) {
    console.warn('No widget type or add callback available')
    return
  }
  
  // Get widget size
  const widgetSize = getWidgetSize(widgetType)
  
  // Calculate drop position
  const rect = event.currentTarget.getBoundingClientRect()
  const dropData = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  }
  
  // Calculate optimal position
  const position = calculateOptimalPosition(dropData, existingWidgets, widgetSize, gridConfig)
  
  // Create widget with calculated position
  const newWidget = {
    i: generateWidgetId(),
    type: widgetType,
    x: position.x,
    y: position.y,
    w: widgetSize.w,
    h: widgetSize.h,
    minW: 1,
    minH: 1,
    maxW: 12,
    maxH: 10,
    static: false
  }
  
  // Add widget with specific position
  onWidgetAdd(widgetType, { position: position })
  
  // Clear global variable
  window.draggedWidgetType = null
}

/**
 * Get widget size based on type
 * @param {string} widgetType - Widget type
 * @returns {Object} - Widget size {w, h}
 */
export const getWidgetSize = (widgetType) => {
  const sizes = {
    'chart': { w: 4, h: 4 },
    'gauge': { w: 3, h: 3 },
    'map': { w: 6, h: 5 },
    'sensor-tile': { w: 3, h: 3 },
    'toggle': { w: 2, h: 2 },
    'slider': { w: 3, h: 3 },
    'notification': { w: 3, h: 4 },
    '3d-model': { w: 4, h: 4 }
  }
  
  return sizes[widgetType] || { w: 3, h: 3 }
}

/**
 * Generate unique widget ID
 * @returns {string} - Unique widget ID
 */
export const generateWidgetId = () => {
  return `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Create visual drop indicator
 * @param {Object} position - Position {x, y}
 * @param {Object} size - Size {w, h}
 * @param {Object} gridConfig - Grid configuration
 * @returns {Object} - Drop indicator style
 */
export const createDropIndicator = (position, size, gridConfig = {}) => {
  const { rowHeight = 80, margin = [16, 16] } = gridConfig
  
  return {
    position: 'absolute',
    left: position.x * (rowHeight + margin[0]),
    top: position.y * (rowHeight + margin[1]),
    width: size.w * (rowHeight + margin[0]) - margin[0],
    height: size.h * (rowHeight + margin[1]) - margin[1],
    border: '2px dashed #ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: '8px',
    pointerEvents: 'none',
    zIndex: 1000
  }
}

/**
 * Enhanced drag start handler
 * @param {Object} event - Drag start event
 * @param {string} widgetType - Widget type
 * @param {Object} options - Additional options
 */
export const handleProfessionalDragStart = (event, widgetType, options = {}) => {
  const { setDraggedWidget } = options
  
  // Set drag data
  event.dataTransfer.effectAllowed = 'copy'
  event.dataTransfer.setData('text/plain', widgetType)
  
  // Set global variable for compatibility
  window.draggedWidgetType = widgetType
  
  // Update local state
  if (setDraggedWidget) {
    setDraggedWidget(widgetType)
  }
  
  // Add visual feedback
  event.target.style.opacity = '0.5'
  
  console.log('Professional drag start:', widgetType)
}

/**
 * Enhanced drag end handler
 * @param {Object} event - Drag end event
 * @param {Object} options - Additional options
 */
export const handleProfessionalDragEnd = (event, options = {}) => {
  const { setDraggedWidget } = options
  
  // Reset visual feedback
  event.target.style.opacity = '1'
  
  // Clear state
  if (setDraggedWidget) {
    setDraggedWidget(null)
  }
  
  // Clear global variable
  window.draggedWidgetType = null
  
  console.log('Professional drag end')
}

/**
 * Create enhanced drop zone with visual feedback
 * @param {Object} options - Drop zone options
 * @returns {Object} - Drop zone configuration
 */
export const createDropZone = (options = {}) => {
  const {
    onDrop,
    onDragOver,
    onDragLeave,
    existingWidgets = [],
    gridConfig = {}
  } = options
  
  return {
    onDrop: (event) => {
      handleProfessionalDrop(event, existingWidgets, onDrop, gridConfig)
    },
    onDragOver: (event) => {
      event.preventDefault()
      event.dataTransfer.dropEffect = 'copy'
      if (onDragOver) onDragOver(event)
    },
    onDragLeave: (event) => {
      if (onDragLeave) onDragLeave(event)
    }
  }
}
