/**
 * Comprehensive Grid Utilities for React-Grid-Layout
 * Provides overlap detection, positioning algorithms, and grid management
 */

/**
 * Check if two grid items overlap
 * @param {Object} item1 - First grid item with x, y, w, h properties
 * @param {Object} item2 - Second grid item with x, y, w, h properties
 * @returns {boolean} - True if items overlap
 */
export const checkCollision = (item1, item2) => {
  if (!item1 || !item2) return false
  
  return !(
    item1.x >= item2.x + item2.w ||
    item2.x >= item1.x + item1.w ||
    item1.y >= item2.y + item2.h ||
    item2.y >= item1.y + item1.h
  )
}

/**
 * Validate all widget positions and detect overlaps
 * @param {Array} widgets - Array of grid items
 * @returns {Array} - Array of overlap objects
 */
export const validateWidgetPositions = (widgets) => {
  const overlaps = []
  for (let i = 0; i < widgets.length; i++) {
    for (let j = i + 1; j < widgets.length; j++) {
      if (checkCollision(widgets[i], widgets[j])) {
        overlaps.push({ 
          widget1: widgets[i], 
          widget2: widgets[j],
          conflict: `${widgets[i].i} overlaps with ${widgets[j].i}`
        })
      }
    }
  }
  return overlaps
}

/**
 * Find the next available position for a new widget
 * @param {Array} widgets - Existing widgets
 * @param {Object} newWidgetSize - Size of new widget {w, h}
 * @param {number} gridCols - Number of grid columns (default: 12)
 * @param {number} maxRows - Maximum number of rows (default: 200)
 * @returns {Object} - Position {x, y}
 */
export const findNextAvailablePosition = (widgets, newWidgetSize, gridCols = 12, maxRows = 200) => {
  
  // If no widgets exist, place at the top-left
  if (!widgets || widgets.length === 0) {
    return { x: 0, y: 0 }
  }
  
  // For the first few widgets, place them in a visible area
  if (widgets.length < 3) {
    const positions = [
      { x: 0, y: 0 },
      { x: 4, y: 0 },
      { x: 8, y: 0 }
    ]
    const position = positions[widgets.length]
    return position
  }
  
  // Create a grid to track occupied positions
  const grid = Array(maxRows).fill(null).map(() => Array(gridCols).fill(false))
  
  // Mark occupied positions
  widgets.forEach(widget => {
    if (widget && typeof widget.x === 'number' && typeof widget.y === 'number') {
      for (let y = widget.y; y < widget.y + (widget.h || 1); y++) {
        for (let x = widget.x; x < widget.x + (widget.w || 1); x++) {
          if (y < grid.length && x < grid[y].length) {
            grid[y][x] = true
          }
        }
      }
    }
  })
  
  // Find the first available position that can fit the new widget
  // Allow placement at the very bottom by extending the search range
  for (let y = 0; y < maxRows; y++) {
    for (let x = 0; x < gridCols - newWidgetSize.w + 1; x++) {
      // Check if the area is free
      let canPlace = true
      for (let dy = 0; dy < newWidgetSize.h; dy++) {
        for (let dx = 0; dx < newWidgetSize.w; dx++) {
          // Allow extending beyond maxRows for bottom placement
          if (x + dx >= gridCols || (y + dy < maxRows && grid[y + dy][x + dx])) {
            canPlace = false
            break
          }
        }
        if (!canPlace) break
      }
      
      if (canPlace) {
        return { x, y }
      }
    }
  }
  
  // If no position found in the grid, place at the bottom with some spacing
  const maxY = Math.max(...widgets.map(w => (w.y || 0) + (w.h || 1)))
  return { x: 0, y: maxY + 1 } // Add extra row spacing
}

/**
 * Auto-fix overlapping widgets by repositioning them
 * @param {Array} widgets - Array of widgets with potential overlaps
 * @param {number} gridCols - Number of grid columns
 * @returns {Array} - Array of repositioned widgets
 */
export const autoFixOverlaps = (widgets, gridCols = 12) => {
  if (!widgets || widgets.length === 0) return widgets
  
  const fixedWidgets = [...widgets]
  const overlaps = validateWidgetPositions(fixedWidgets)
  
  if (overlaps.length === 0) return fixedWidgets
  
  // Sort widgets by y position to maintain order
  fixedWidgets.sort((a, b) => a.y - b.y)
  
  // Fix overlaps by repositioning conflicting widgets
  for (let i = 0; i < fixedWidgets.length; i++) {
    const currentWidget = fixedWidgets[i]
    
    // Check for overlaps with previous widgets
    for (let j = 0; j < i; j++) {
      const previousWidget = fixedWidgets[j]
      
      if (checkCollision(currentWidget, previousWidget)) {
        // Move current widget to the right of the previous widget
        const newX = previousWidget.x + previousWidget.w
        if (newX + currentWidget.w <= gridCols) {
          currentWidget.x = newX
        } else {
          // Move to next row
          currentWidget.x = 0
          currentWidget.y = previousWidget.y + previousWidget.h
        }
      }
    }
  }
  
  return fixedWidgets
}

/**
 * Generate a unique widget ID
 * @param {string} prefix - Prefix for the ID (default: 'widget')
 * @returns {string} - Unique widget ID
 */
export const generateWidgetId = (prefix = 'widget') => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Get standard widget size based on type
 * @param {string} widgetType - Type of widget
 * @returns {Object} - Widget size {w, h}
 */
export const getWidgetSize = (widgetType) => {
  const sizeMap = {
    'gauge': { w: 3, h: 3 },
    'chart': { w: 4, h: 4 },
    'toggle': { w: 2, h: 2 },
    'slider': { w: 3, h: 3 },
    'map': { w: 6, h: 5 },
    '3d-model': { w: 4, h: 4 },
    'notification': { w: 3, h: 4 },
    'sensor-tile': { w: 3, h: 3 }
  }
  
  return sizeMap[widgetType] || { w: 3, h: 3 }
}

/**
 * Validate widget data structure
 * @param {Object} widget - Widget object to validate
 * @returns {Object} - Validated widget with defaults
 */
export const validateWidget = (widget) => {
  if (!widget || typeof widget !== 'object') {
    throw new Error('Widget must be an object')
  }
  
  const validatedWidget = {
    i: widget.i || generateWidgetId(),
    x: typeof widget.x === 'number' ? widget.x : 0,
    y: typeof widget.y === 'number' ? widget.y : 0,
    w: typeof widget.w === 'number' ? widget.w : 3,
    h: typeof widget.h === 'number' ? widget.h : 2,
    minW: typeof widget.minW === 'number' ? widget.minW : 1,
    minH: typeof widget.minH === 'number' ? widget.minH : 1,
    maxW: typeof widget.maxW === 'number' ? widget.maxW : 12,
    maxH: typeof widget.maxH === 'number' ? widget.maxH : 10,
    static: Boolean(widget.static),
    ...widget
  }
  
  // Ensure min/max values are valid and logical
  validatedWidget.minW = Math.max(1, Math.min(validatedWidget.minW, validatedWidget.w))
  validatedWidget.minH = Math.max(1, Math.min(validatedWidget.minH, validatedWidget.h))
  validatedWidget.maxW = Math.max(validatedWidget.w, Math.min(12, validatedWidget.maxW))
  validatedWidget.maxH = Math.max(validatedWidget.h, Math.min(10, validatedWidget.maxH))
  
  return validatedWidget
}

/**
 * Create a new widget with proper positioning
 * @param {string} widgetType - Type of widget
 * @param {Array} existingWidgets - Existing widgets array
 * @param {Object} options - Additional widget options
 * @returns {Object} - New widget object
 */
export const createWidget = (widgetType, existingWidgets = [], options = {}) => {
  
  const size = getWidgetSize(widgetType)
  const position = findNextAvailablePosition(existingWidgets, size)
  
  // Default settings for each widget type
  const defaultSettings = {
    title: `${widgetType.charAt(0).toUpperCase() + widgetType.slice(1)}`,
    dataType: 'int',
    entryType: 'automatic',
    minValue: 0,
    maxValue: 100,
    dataChannelId: 0,
    // Additional default values for backward compatibility
    min: 0,
    max: 100,
    value: 50,
    color: '#3b82f6',
    status: false,
    location: 'Device Location',
    unit: '',
    chartType: 'line',
    modelType: 'cube'
  }
  
  const newWidget = {
    i: generateWidgetId(),
    type: widgetType,
    x: position.x,
    y: position.y,
    w: size.w,
    h: size.h,
    minW: 1, // Always allow minimum width of 1
    minH: 1, // Always allow minimum height of 1
    maxW: 12, // Allow maximum width of 12 (full grid)
    maxH: 10, // Allow maximum height of 10
    static: false,
    ...defaultSettings, // Apply default settings
    ...options // Override with any provided options
  }
  
  return validateWidget(newWidget)
}

/**
 * Fix existing widgets to have proper min/max values
 * @param {Array} widgets - Array of widgets to fix
 * @returns {Array} - Fixed widgets array
 */
export const fixWidgetMinMaxValues = (widgets) => {
  return widgets.map(widget => {
    const fixedWidget = {
      ...widget,
      minW: 1,
      minH: 1,
      maxW: 12,
      maxH: 10
    }
    
    // Ensure min/max values are valid and logical
    fixedWidget.minW = Math.max(1, Math.min(fixedWidget.minW, fixedWidget.w))
    fixedWidget.minH = Math.max(1, Math.min(fixedWidget.minH, fixedWidget.h))
    fixedWidget.maxW = Math.max(fixedWidget.w, Math.min(12, fixedWidget.maxW))
    fixedWidget.maxH = Math.max(fixedWidget.h, Math.min(10, fixedWidget.maxH))
    
    return fixedWidget
  })
}

/**
 * Fix layout items to have proper min/max values
 * @param {Object} layouts - Layouts object to fix
 * @returns {Object} - Fixed layouts object
 */
export const fixLayoutMinMaxValues = (layouts) => {
  const fixedLayouts = {}
  
  Object.keys(layouts).forEach(breakpoint => {
    fixedLayouts[breakpoint] = layouts[breakpoint].map(item => ({
      ...item,
      minW: item.minW || 1,
      minH: item.minH || 1,
      maxW: item.maxW || 12,
      maxH: item.maxH || 10
    }))
  })
  
  return fixedLayouts
}

/**
 * Grid layout configuration for different breakpoints
 */
export const GRID_CONFIG = {
  breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
  cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
  rowHeight: 80,
  margin: [16, 16],
  containerPadding: [16, 16, 32, 16], // Add bottom padding to ensure widgets are visible
  maxRows: 1000, // Increased to allow more widgets at the bottom
  preventCollision: true,
  compactType: 'vertical',
  autoSize: true,
  allowOverlap: false,
  isBounded: false // Allow unbounded growth for bottom placement
}

/**
 * Enhanced grid layout props with overlap prevention
 */
export const getGridLayoutProps = (isPreviewMode = false) => ({
  className: 'layout',
  rowHeight: GRID_CONFIG.rowHeight,
  isDraggable: !isPreviewMode,
  isResizable: !isPreviewMode,
  margin: GRID_CONFIG.margin,
  containerPadding: GRID_CONFIG.containerPadding,
  useCSSTransforms: true,
  transformScale: 1,
  draggableHandle: null, // Allow dragging from anywhere on the widget
  preventCollision: false, // Disable preventCollision to allow manual positioning
  compactType: null, // Disable compacting to maintain positions
  autoSize: true,
  allowOverlap: false,
  isBounded: false, // Allow unbounded growth for bottom placement
  resizeHandles: isPreviewMode ? [] : ['se'],
  maxRows: GRID_CONFIG.maxRows,
  droppingItem: { i: '__dropping-elem__', w: 3, h: 3, minW: 1, minH: 1, maxW: 12, maxH: 10 },
  breakpoints: GRID_CONFIG.breakpoints,
  cols: GRID_CONFIG.cols,
  // Ensure widgets stay within bounds
  isDroppable: !isPreviewMode,
  // Allow dynamic height expansion for bottom placement
  style: { 
    width: '100%',
    minHeight: '100%',
    height: 'auto',
    overflow: 'visible'
  }
})

/**
 * Debounce function for performance optimization
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, wait) => {
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
