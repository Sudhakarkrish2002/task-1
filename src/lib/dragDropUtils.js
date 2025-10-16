/**
 * Professional Drag and Drop Utilities
 * Enhanced positioning logic for better widget placement with smooth animations
 */

// Animation configuration
const ANIMATION_CONFIG = {
  duration: 200, // Reduced for better responsiveness
  easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Optimized easing
  spring: {
    tension: 300,
    friction: 30
  }
}

// Global drag state for performance optimization
window.dragState = {
  isDragging: false,
  draggedWidgetType: null,
  lastDragPosition: null,
  dragStartTime: null
}

// Optimized throttle function
const throttle = (func, limit) => {
  let inThrottle
  return function() {
    const args = arguments
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// Performance-optimized debounce
const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Calculate the optimal position for a new widget based on drop coordinates
 * Enhanced to work perfectly across entire dashboard width, especially right side
 * @param {Object} dropData - Drop event data with x, y, containerWidth
 * @param {Array} existingWidgets - Current widgets
 * @param {Object} widgetSize - Size of the widget to place
 * @param {Object} gridConfig - Grid configuration
 * @returns {Object} - Optimal position {x, y}
 */
export const calculateOptimalPosition = (dropData, existingWidgets, widgetSize, gridConfig = {}) => {
  const { cols = 12, rowHeight = 60, margin = [12, 12], containerWidth } = gridConfig
  
  // If no widgets exist, place at top-left
  if (!existingWidgets || existingWidgets.length === 0) {
    return { x: 0, y: 0 }
  }
  
  // Calculate cell size dynamically based on container width
  // This ensures accurate positioning across the entire width, including right side
  const effectiveWidth = containerWidth || (typeof window !== 'undefined' ? window.innerWidth - 280 : 1140) // Subtract sidebar width
  const cellWidth = (effectiveWidth - (margin[0] * (cols + 1))) / cols
  const cellHeight = rowHeight
  
  // Convert drop coordinates to grid coordinates with improved precision
  const gridX = Math.floor(dropData.x / (cellWidth + margin[0]))
  const gridY = Math.floor(dropData.y / (cellHeight + margin[1]))
  
  // Clamp to grid bounds - ensure we can drop all the way to the right edge
  const clampedX = Math.max(0, Math.min(gridX, cols - widgetSize.w))
  const clampedY = Math.max(0, gridY)
  
  console.log('📍 Enhanced Drop Calculation:', {
    dropCoords: dropData,
    containerWidth: effectiveWidth,
    cellWidth,
    cellHeight,
    gridCoords: { gridX, gridY },
    finalCoords: { x: clampedX, y: clampedY },
    cols,
    widgetSize
  })
  
  // Check if position is available
  if (isPositionAvailable(clampedX, clampedY, widgetSize, existingWidgets)) {
    console.log('✅ Position available:', { x: clampedX, y: clampedY })
    return { x: clampedX, y: clampedY }
  }
  
  // If position is occupied, find nearest available position
  console.log('⚠️ Position occupied, finding nearest...')
  const nearestPosition = findNearestAvailablePosition(clampedX, clampedY, widgetSize, existingWidgets, cols)
  console.log('✅ Nearest position:', nearestPosition)
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
    
    // Check for overlap - widgets overlap if they intersect in both x and y axes
    const overlapX = !(newRight <= widget.x || widgetRight <= x)
    const overlapY = !(newBottom <= widget.y || widgetBottom <= y)
    
    return overlapX && overlapY
  })
}

/**
 * Find the nearest available position to the desired location with smart collision avoidance
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
 * Smart collision detection with automatic widget repositioning
 * @param {Object} draggedWidget - The widget being dragged
 * @param {Array} existingWidgets - Current widgets
 * @param {Object} newPosition - New position {x, y}
 * @param {Function} onWidgetMove - Callback for moving widgets
 * @returns {Object} - Final position and any moved widgets
 */
export const handleSmartCollision = (draggedWidget, existingWidgets, newPosition, onWidgetMove) => {
  const { x: newX, y: newY } = newPosition
  const draggedSize = { w: draggedWidget.w, h: draggedWidget.h }
  
  // Find widgets that would collide with the new position
  const collidingWidgets = existingWidgets.filter(widget => {
    if (widget.i === draggedWidget.i) return false // Don't check against self
    
    const widgetRight = widget.x + widget.w
    const widgetBottom = widget.y + widget.h
    const newRight = newX + draggedSize.w
    const newBottom = newY + draggedSize.h
    
    return !(
      newX >= widgetRight ||
      newRight <= widget.x ||
      newY >= widgetBottom ||
      newBottom <= widget.y
    )
  })
  
  if (collidingWidgets.length === 0) {
    return { position: newPosition, movedWidgets: [] }
  }
  
  // Calculate displacement for colliding widgets
  const movedWidgets = []
  const displacement = { x: draggedSize.w, y: 0 } // Default: push right
  
  collidingWidgets.forEach(widget => {
    const newWidgetPosition = {
      x: Math.min(widget.x + displacement.x, 12 - widget.w),
      y: widget.y + displacement.y
    }
    
    // If pushing right would go out of bounds, push down instead
    if (newWidgetPosition.x + widget.w > 12) {
      newWidgetPosition.x = widget.x
      newWidgetPosition.y = widget.y + draggedSize.h + 1
    }
    
    // Ensure position is valid
    if (newWidgetPosition.x < 0) newWidgetPosition.x = 0
    if (newWidgetPosition.y < 0) newWidgetPosition.y = 0
    
    movedWidgets.push({
      widget,
      newPosition: newWidgetPosition
    })
    
    // Apply smooth movement
    if (onWidgetMove) {
      onWidgetMove(widget.i, newWidgetPosition)
    }
  })
  
  return { position: newPosition, movedWidgets }
}

/**
 * Optimized smooth animation for widget movement using CSS transforms
 * @param {HTMLElement} element - Element to animate
 * @param {Object} fromPosition - Starting position
 * @param {Object} toPosition - Target position
 * @param {Function} onComplete - Completion callback
 */
export const animateWidgetMovement = (element, fromPosition, toPosition, onComplete) => {
  if (!element) return
  
  // Use CSS transitions for better performance
  element.style.transition = `transform ${ANIMATION_CONFIG.duration}ms ${ANIMATION_CONFIG.easing}`
  element.style.transform = `translate(${toPosition.x}px, ${toPosition.y}px)`
  
  // Add class for additional styling
  element.classList.add('smooth-move')
  
  // Clean up after animation
  setTimeout(() => {
    element.classList.remove('smooth-move')
    if (onComplete) onComplete()
  }, ANIMATION_CONFIG.duration)
}

/**
 * Batch animate multiple widgets for better performance
 * @param {Array} animations - Array of animation objects
 * @param {Function} onComplete - Completion callback
 */
export const batchAnimateWidgets = (animations, onComplete) => {
  if (!animations.length) {
    if (onComplete) onComplete()
    return
  }
  
  let completedCount = 0
  const totalAnimations = animations.length
  
  animations.forEach((animation, index) => {
    setTimeout(() => {
      animateWidgetMovement(
        animation.element,
        animation.fromPosition,
        animation.toPosition,
        () => {
          completedCount++
          if (completedCount === totalAnimations && onComplete) {
            onComplete()
          }
        }
      )
    }, index * 50) // Reduced stagger delay for smoother experience
  })
}

/**
 * Easing function for smooth animations
 * @param {number} t - Progress (0-1)
 * @returns {number} - Eased progress
 */
const easeInOutCubic = (t) => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/**
 * Enhanced drop handler with professional positioning
 * Improved to work perfectly across entire dashboard width including right side
 * @param {Object} event - Drop event
 * @param {Array} existingWidgets - Current widgets
 * @param {Function} onWidgetAdd - Widget add callback
 * @param {Object} gridConfig - Grid configuration
 */
export const handleProfessionalDrop = (event, existingWidgets, onWidgetAdd, gridConfig = {}) => {
  event.preventDefault()
  event.stopPropagation()
  
  // Get widget type from drag data
  const widgetType = event.dataTransfer.getData('text/plain') || window.draggedWidgetType
  
  if (!widgetType || !onWidgetAdd) {
    console.warn('⚠️ No widget type or add callback available')
    return
  }
  
  // Get widget size based on current breakpoint
  const widgetSize = getWidgetSize(widgetType)
  
  // Calculate drop position with enhanced precision for right side
  const rect = event.currentTarget.getBoundingClientRect()
  const dropData = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
    containerWidth: rect.width // Pass container width for accurate calculations
  }
  
  console.log('🎯 Drop event at:', {
    clientX: event.clientX,
    clientY: event.clientY,
    rectLeft: rect.left,
    rectTop: rect.top,
    rectWidth: rect.width,
    dropData
  })
  
  // Calculate optimal position with container width for scalability
  const position = calculateOptimalPosition(dropData, existingWidgets, widgetSize, {
    ...gridConfig,
    containerWidth: rect.width
  })
  
  console.log('✅ Final widget position:', position)
  
  // Add widget with specific position
  onWidgetAdd(widgetType, { position: position })
  
  // Clear global variables
  window.draggedWidgetType = null
  window.dragState.isDragging = false
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
    '3d-model': { w: 4, h: 5 }
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
 * Optimized drag start handler with smooth animations
 * @param {Object} event - Drag start event
 * @param {string} widgetType - Widget type
 * @param {Object} options - Additional options
 */
export const handleProfessionalDragStart = (event, widgetType, options = {}) => {
  const { setDraggedWidget, onDragStart } = options
  
  // Set global drag state
  window.dragState.isDragging = true
  window.dragState.draggedWidgetType = widgetType
  window.dragState.dragStartTime = performance.now()
  window.isDragging = true // For compatibility
  
  // Set drag data
  event.dataTransfer.effectAllowed = 'copy'
  event.dataTransfer.setData('text/plain', widgetType)
  
  // Set global variable for compatibility
  window.draggedWidgetType = widgetType
  
  // Update local state
  if (setDraggedWidget) {
    setDraggedWidget(widgetType)
  }
  
  // Use requestAnimationFrame for smooth visual feedback
  requestAnimationFrame(() => {
    const element = event.target
    element.style.transition = `all ${ANIMATION_CONFIG.duration}ms ${ANIMATION_CONFIG.easing}`
    element.style.opacity = '0.7'
    element.style.transform = 'scale(1.05) rotate(2deg) translateZ(0)'
    element.style.zIndex = '1000'
    element.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)'
    element.style.willChange = 'transform, opacity'
    
    // Add drag class for additional styling
    element.classList.add('dragging')
  })
  
  // Call custom drag start handler
  if (onDragStart) {
    onDragStart(widgetType, event)
  }
  
  console.log('Optimized drag start:', widgetType)
}

/**
 * Optimized drag end handler with smooth reset animations
 * @param {Object} event - Drag end event
 * @param {Object} options - Additional options
 */
export const handleProfessionalDragEnd = (event, options = {}) => {
  const { setDraggedWidget, onDragEnd } = options
  
  // Clear global drag state
  window.dragState.isDragging = false
  window.dragState.draggedWidgetType = null
  window.dragState.lastDragPosition = null
  window.dragState.dragStartTime = null
  window.isDragging = false // For compatibility
  
  // Use requestAnimationFrame for smooth reset
  requestAnimationFrame(() => {
    const element = event.target
    element.style.transition = `all ${ANIMATION_CONFIG.duration}ms ${ANIMATION_CONFIG.easing}`
    element.style.opacity = '1'
    element.style.transform = 'scale(1) rotate(0deg) translateZ(0)'
    element.style.zIndex = 'auto'
    element.style.boxShadow = ''
    element.style.willChange = 'auto'
    
    // Remove drag class
    element.classList.remove('dragging')
  })
  
  // Clear state
  if (setDraggedWidget) {
    setDraggedWidget(null)
  }
  
  // Clear global variable
  window.draggedWidgetType = null
  
  // Call custom drag end handler
  if (onDragEnd) {
    onDragEnd(event)
  }
  
  console.log('Optimized drag end')
}

/**
 * Enhanced drag over handler with real-time collision detection
 * Improved for full-width dragging including right side of dashboard
 * @param {Object} event - Drag over event
 * @param {Array} existingWidgets - Current widgets
 * @param {Object} options - Additional options
 */
export const handleEnhancedDragOver = (event, existingWidgets, options = {}) => {
  const { onDragOver, onCollisionDetected, gridConfig = {} } = options
  
  event.preventDefault()
  event.stopPropagation()
  
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'copy'
  }
  
  // Get widget type and size
  const widgetType = event.dataTransfer.getData('text/plain') || window.draggedWidgetType
  if (!widgetType) return
  
  const widgetSize = getWidgetSize(widgetType)
  
  // Calculate drop position with container width for accurate right-side detection
  const rect = event.currentTarget.getBoundingClientRect()
  const dropData = {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
    containerWidth: rect.width
  }
  
  // Convert to grid coordinates with dynamic cell sizing
  const { cols = 12, rowHeight = 60, margin = [12, 12] } = gridConfig
  const effectiveWidth = rect.width
  const cellWidth = (effectiveWidth - (margin[0] * (cols + 1))) / cols
  const cellHeight = rowHeight
  
  const gridX = Math.floor(dropData.x / (cellWidth + margin[0]))
  const gridY = Math.floor(dropData.y / (cellHeight + margin[1]))
  
  // Clamp to grid bounds - ensure full-width coverage
  const clampedX = Math.max(0, Math.min(gridX, cols - widgetSize.w))
  const clampedY = Math.max(0, gridY)
  
  // Store last drag position for smoother feedback
  window.dragState.lastDragPosition = { x: clampedX, y: clampedY }
  
  // Check for collisions
  const collidingWidgets = existingWidgets.filter(widget => {
    const widgetRight = widget.x + widget.w
    const widgetBottom = widget.y + widget.h
    const newRight = clampedX + widgetSize.w
    const newBottom = clampedY + widgetSize.h
    
    return !(
      clampedX >= widgetRight ||
      newRight <= widget.x ||
      clampedY >= widgetBottom ||
      newBottom <= widget.y
    )
  })
  
  // Provide visual feedback for collisions
  if (collidingWidgets.length > 0 && onCollisionDetected) {
    onCollisionDetected(collidingWidgets, { x: clampedX, y: clampedY })
  }
  
  // Call original drag over handler
  if (onDragOver) {
    onDragOver(event, { position: { x: clampedX, y: clampedY }, collidingWidgets, cellWidth })
  }
}

/**
 * Create enhanced drop zone with visual feedback and collision detection
 * @param {Object} options - Drop zone options
 * @returns {Object} - Drop zone configuration
 */
export const createDropZone = (options = {}) => {
  const {
    onDrop,
    onDragOver,
    onDragLeave,
    onCollisionDetected,
    existingWidgets = [],
    gridConfig = {}
  } = options
  
  return {
    onDrop: (event) => {
      handleProfessionalDrop(event, existingWidgets, onDrop, gridConfig)
    },
    onDragOver: (event) => {
      handleEnhancedDragOver(event, existingWidgets, {
        onDragOver,
        onCollisionDetected,
        gridConfig
      })
    },
    onDragLeave: (event) => {
      if (onDragLeave) onDragLeave(event)
    }
  }
}
