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
  
  // Check if items are the same (should not collide with themselves)
  if (item1.i === item2.i) return false
  
  // Calculate boundaries
  const item1Right = item1.x + item1.w
  const item1Bottom = item1.y + item1.h
  const item2Right = item2.x + item2.w
  const item2Bottom = item2.y + item2.h
  
  // Check for overlap - items overlap if they intersect in both x and y axes
  const overlapX = !(item1Right <= item2.x || item2Right <= item1.x)
  const overlapY = !(item1Bottom <= item2.y || item2Bottom <= item1.y)
  
  return overlapX && overlapY
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
  if (widgets.length < 4) {
    const positions = [
      { x: 0, y: 0 },
      { x: 4, y: 0 },
      { x: 8, y: 0 },
      { x: 0, y: 3 } // Start placing widgets in the next row
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
    for (let x = 0; x <= gridCols - newWidgetSize.w; x++) {
      // Check if the area is free
      let canPlace = true
      for (let dy = 0; dy < newWidgetSize.h; dy++) {
        for (let dx = 0; dx < newWidgetSize.w; dx++) {
          // Check bounds and occupancy
          if (x + dx >= gridCols || y + dy >= maxRows || grid[y + dy][x + dx]) {
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
  console.log('No available position found, placing at bottom. Max Y:', maxY)
  return { x: 0, y: maxY + 2 } // Add extra row spacing for better visibility
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
  
  console.log('Auto-fixing overlaps:', overlaps)
  
  // Create a grid to track occupied positions
  const maxRows = 1000
  const grid = Array(maxRows).fill(null).map(() => Array(gridCols).fill(false))
  
  // Sort widgets by y position, then by x position to maintain order
  fixedWidgets.sort((a, b) => {
    if (a.y !== b.y) return a.y - b.y
    return a.x - b.x
  })
  
  // Mark initial occupied positions
  fixedWidgets.forEach(widget => {
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
  
  // Fix overlaps by finding new positions for overlapping widgets
  for (let i = 0; i < fixedWidgets.length; i++) {
    const currentWidget = fixedWidgets[i]
    
    // Check for overlaps with all other widgets
    for (let j = i + 1; j < fixedWidgets.length; j++) {
      const otherWidget = fixedWidgets[j]
      
      if (checkCollision(currentWidget, otherWidget)) {
        console.log(`Fixing overlap between ${currentWidget.i} and ${otherWidget.i}`)
        
        // Clear current widget's position in grid
        for (let y = currentWidget.y; y < currentWidget.y + currentWidget.h; y++) {
          for (let x = currentWidget.x; x < currentWidget.x + currentWidget.w; x++) {
            if (y < grid.length && x < grid[y].length) {
              grid[y][x] = false
            }
          }
        }
        
        // Find new position for current widget
        let newPosition = null
        
        // Try to place to the right of the other widget first
        const rightX = otherWidget.x + otherWidget.w
        if (rightX + currentWidget.w <= gridCols) {
          // Check if this position is available
          let canPlace = true
          for (let y = otherWidget.y; y < otherWidget.y + currentWidget.h; y++) {
            for (let x = rightX; x < rightX + currentWidget.w; x++) {
              if (y < grid.length && x < grid[y].length && grid[y][x]) {
                canPlace = false
                break
              }
            }
            if (!canPlace) break
          }
          
          if (canPlace) {
            newPosition = { x: rightX, y: otherWidget.y }
          }
        }
        
        // If right placement doesn't work, try below
        if (!newPosition) {
          const belowY = otherWidget.y + otherWidget.h
          let canPlace = true
          for (let y = belowY; y < belowY + currentWidget.h; y++) {
            for (let x = 0; x < currentWidget.w; x++) {
              if (y < grid.length && x < grid[y].length && grid[y][x]) {
                canPlace = false
                break
              }
            }
            if (!canPlace) break
          }
          
          if (canPlace) {
            newPosition = { x: 0, y: belowY }
          }
        }
        
        // If still no position, find next available position
        if (!newPosition) {
          newPosition = findNextAvailablePosition(
            fixedWidgets.filter((_, index) => index !== i), 
            { w: currentWidget.w, h: currentWidget.h }, 
            gridCols
          )
        }
        
        // Update widget position
        currentWidget.x = newPosition.x
        currentWidget.y = newPosition.y
        
        // Mark new position as occupied
        for (let y = currentWidget.y; y < currentWidget.y + currentWidget.h; y++) {
          for (let x = currentWidget.x; x < currentWidget.x + currentWidget.w; x++) {
            if (y < grid.length && x < grid[y].length) {
              grid[y][x] = true
            }
          }
        }
        
        console.log(`Moved ${currentWidget.i} to position: x: ${newPosition.x}, y: ${newPosition.y}`)
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
 * @returns {Object} - Widget size {w, h, minW, minH, maxW, maxH}
 */
export const getWidgetSize = (widgetType) => {
  const sizeMap = {
    'gauge': { w: 3, h: 3, minW: 2, minH: 2, maxW: 6, maxH: 6 },
    'chart': { w: 4, h: 4, minW: 3, minH: 3, maxW: 12, maxH: 8 },
    'toggle': { w: 2, h: 2, minW: 1, minH: 1, maxW: 4, maxH: 4 },
    'slider': { w: 3, h: 3, minW: 2, minH: 2, maxW: 6, maxH: 6 },
    'map': { w: 6, h: 5, minW: 4, minH: 4, maxW: 12, maxH: 10 },
    '3d-model': { w: 4, h: 5, minW: 3, minH: 4, maxW: 8, maxH: 10 },
    'notification': { w: 3, h: 4, minW: 2, minH: 3, maxW: 6, maxH: 8 },
    'sensor-tile': { w: 3, h: 3, minW: 2, minH: 2, maxW: 6, maxH: 6 }
  }
  
  return sizeMap[widgetType] || { w: 3, h: 3, minW: 1, minH: 1, maxW: 12, maxH: 10 }
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
  validatedWidget.minW = Math.max(1, Math.min(validatedWidget.minW, validatedWidget.w - 1))
  validatedWidget.minH = Math.max(1, Math.min(validatedWidget.minH, validatedWidget.h - 1))
  validatedWidget.maxW = Math.max(validatedWidget.w, Math.min(12, validatedWidget.maxW))
  validatedWidget.maxH = Math.max(validatedWidget.h, Math.min(10, validatedWidget.maxH))
  
  // Ensure minW is always less than w, and minH is always less than h
  if (validatedWidget.minW >= validatedWidget.w) {
    validatedWidget.minW = Math.max(1, validatedWidget.w - 1)
  }
  if (validatedWidget.minH >= validatedWidget.h) {
    validatedWidget.minH = Math.max(1, validatedWidget.h - 1)
  }
  
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
    location: widgetType === 'toggle' ? undefined : 'Device Location', // Remove location for toggle widgets
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
    minW: Math.max(1, Math.min(size.minW || 1, size.w - 1)), // Ensure minW < w
    minH: Math.max(1, Math.min(size.minH || 1, size.h - 1)), // Ensure minH < h
    maxW: size.maxW || 12, // Use widget-specific maximum width
    maxH: size.maxH || 10, // Use widget-specific maximum height
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
      // Ensure all required properties exist
      w: widget.w || 3,
      h: widget.h || 2,
      minW: widget.minW || 1,
      minH: widget.minH || 1,
      maxW: widget.maxW || 12,
      maxH: widget.maxH || 10
    }
    
    // Ensure min/max values are valid and logical
    fixedWidget.minW = Math.max(1, Math.min(fixedWidget.minW, fixedWidget.w - 1))
    fixedWidget.minH = Math.max(1, Math.min(fixedWidget.minH, fixedWidget.h - 1))
    fixedWidget.maxW = Math.max(fixedWidget.w, Math.min(12, fixedWidget.maxW))
    fixedWidget.maxH = Math.max(fixedWidget.h, Math.min(10, fixedWidget.maxH))
    
    // Final safety check - ensure minW is always less than w, and minH is always less than h
    if (fixedWidget.minW >= fixedWidget.w) {
      fixedWidget.minW = Math.max(1, fixedWidget.w - 1)
    }
    if (fixedWidget.minH >= fixedWidget.h) {
      fixedWidget.minH = Math.max(1, fixedWidget.h - 1)
    }
    
    // Ensure w and h are at least 1
    fixedWidget.w = Math.max(1, fixedWidget.w)
    fixedWidget.h = Math.max(1, fixedWidget.h)
    
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
 * Updated to ensure consistency with drag-drop calculations
 */
export const GRID_CONFIG = {
  breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
  cols: { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 },
  rowHeight: 80,
  margin: [16, 16], // Consistent with drag-drop calculations
  containerPadding: [16, 16, 32, 16], // Consistent with drag-drop calculations
  maxRows: 1000, // Increased to allow more widgets at the bottom
  preventCollision: true,
  compactType: 'vertical',
  autoSize: true,
  allowOverlap: false,
  isBounded: false // Allow unbounded growth for full-width scalability
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
  containerPadding: isPreviewMode ? [20, 20, 100, 20] : GRID_CONFIG.containerPadding,
  useCSSTransforms: true,
  transformScale: 1,
  draggableHandle: null, // Allow dragging from anywhere on the widget
  preventCollision: true, // Always prevent collision
  compactType: 'vertical', // Always use vertical compacting
  autoSize: isPreviewMode ? false : GRID_CONFIG.autoSize, // Disable autoSize in preview mode
  allowOverlap: false, // Never allow overlaps
  isBounded: isPreviewMode ? false : GRID_CONFIG.isBounded, // Allow unbounded in preview mode for better viewing
  resizeHandles: isPreviewMode ? [] : ['se'],
  maxRows: GRID_CONFIG.maxRows,
  droppingItem: { i: '__dropping-elem__', w: 3, h: 3, minW: 1, minH: 1, maxW: 12, maxH: 10 },
  breakpoints: GRID_CONFIG.breakpoints,
  cols: GRID_CONFIG.cols,
  // Ensure widgets stay within bounds
  isDroppable: !isPreviewMode,
  // Allow dynamic height expansion and full-width scalability
  style: { 
    width: '100%',
    maxWidth: 'none', // Ensure no width constraints on large monitors
    minHeight: isPreviewMode ? '800px' : '100%',
    height: isPreviewMode ? 'auto' : 'auto',
    overflow: isPreviewMode ? 'visible' : 'visible',
    background: 'transparent', // Remove any background for cleaner look
    paddingBottom: isPreviewMode ? '100px' : '0px' // Add bottom padding for preview mode
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
