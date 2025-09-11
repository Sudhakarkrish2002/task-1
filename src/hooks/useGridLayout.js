import { useState, useCallback, useRef, useEffect } from 'react'
import { 
  validateWidgetPositions, 
  findNextAvailablePosition, 
  autoFixOverlaps,
  createWidget,
  validateWidget,
  generateWidgetId,
  getWidgetSize,
  debounce,
  fixWidgetMinMaxValues
} from '../lib/gridUtils'

/**
 * Custom hook for managing React-Grid-Layout with overlap prevention
 * @param {Object} options - Configuration options
 * @returns {Object} - Grid layout state and methods
 */
export const useGridLayout = (options = {}) => {
  const {
    initialWidgets = [],
    initialLayouts = {},
    gridCols = 12,
    maxRows = 200,
    enableOverlapPrevention = true,
    enableAutoFix = true,
    debounceMs = 300
  } = options

  const [widgets, setWidgets] = useState(initialWidgets)
  const [layouts, setLayouts] = useState(initialLayouts)
  const [selectedWidget, setSelectedWidget] = useState(null)
  const [overlaps, setOverlaps] = useState([])
  const [isValidating, setIsValidating] = useState(false)
  
  const validationTimeoutRef = useRef(null)

  // Fix widget min/max values when initial widgets are loaded
  useEffect(() => {
    if (initialWidgets.length > 0) {
      const fixedWidgets = fixWidgetMinMaxValues(initialWidgets)
      setWidgets(fixedWidgets)
    }
  }, [initialWidgets])

  // Load initial layouts when they change
  useEffect(() => {
    if (Object.keys(initialLayouts).length > 0) {
      setLayouts(initialLayouts)
    }
  }, [initialLayouts])

  // Debounced validation function
  const debouncedValidate = useCallback(
    debounce((widgetList) => {
      if (!enableOverlapPrevention) return
      
      setIsValidating(true)
      const detectedOverlaps = validateWidgetPositions(widgetList)
      setOverlaps(detectedOverlaps)
      
      if (detectedOverlaps.length > 0) {
        console.warn('Widget overlaps detected:', detectedOverlaps)
        
        if (enableAutoFix) {
          const fixedWidgets = autoFixOverlaps(widgetList, gridCols)
          setWidgets(fixedWidgets)
        }
      }
      
      setIsValidating(false)
    }, debounceMs),
    [enableOverlapPrevention, enableAutoFix, gridCols, debounceMs]
  )

  // Validate widgets whenever they change
  useEffect(() => {
    if (widgets.length > 0) {
      debouncedValidate(widgets)
    }
  }, [widgets, debouncedValidate])

  // Add a new widget
  const addWidget = useCallback((widgetType, widgetOptions = {}) => {
    const newWidget = createWidget(widgetType, widgets, widgetOptions)
    
    setWidgets(prev => {
      const updatedWidgets = [...prev, newWidget]
      
      // Validate immediately for new widgets
      if (enableOverlapPrevention) {
        const detectedOverlaps = validateWidgetPositions(updatedWidgets)
        if (detectedOverlaps.length > 0 && enableAutoFix) {
          const fixedWidgets = autoFixOverlaps(updatedWidgets, gridCols)
          return fixedWidgets
        }
      }
      
      return updatedWidgets
    })
    
    // Update layouts to include the new widget
    setLayouts(prevLayouts => {
      const newLayouts = { ...prevLayouts }
      // Initialize lg layout if it doesn't exist
      if (!newLayouts.lg) {
        newLayouts.lg = []
      }
      // Add the new widget to the layout
      newLayouts.lg.push({
        i: newWidget.i,
        x: newWidget.x,
        y: newWidget.y,
        w: newWidget.w,
        h: newWidget.h,
        minW: newWidget.minW,
        minH: newWidget.minH,
        maxW: newWidget.maxW,
        maxH: newWidget.maxH
      })
      return newLayouts
    })
    
    setSelectedWidget(newWidget)
    return newWidget
  }, [widgets, enableOverlapPrevention, enableAutoFix, gridCols])

  // Remove a widget
  const removeWidget = useCallback((widgetId) => {
    setWidgets(prev => prev.filter(w => w.i !== widgetId))
    
    // Update layouts to remove the widget
    setLayouts(prevLayouts => {
      const newLayouts = { ...prevLayouts }
      Object.keys(newLayouts).forEach(breakpoint => {
        newLayouts[breakpoint] = newLayouts[breakpoint].filter(item => item.i !== widgetId)
      })
      return newLayouts
    })
    
    if (selectedWidget?.i === widgetId) {
      setSelectedWidget(null)
    }
  }, [selectedWidget])

  // Update a widget
  const updateWidget = useCallback((widgetId, updates) => {
    setWidgets(prev => prev.map(w => 
      w.i === widgetId ? { ...w, ...updates } : w
    ))
  }, [])

  // Duplicate a widget
  const duplicateWidget = useCallback((widgetId) => {
    const widgetToDuplicate = widgets.find(w => w.i === widgetId)
    if (!widgetToDuplicate) return null

    const duplicatedWidget = {
      ...widgetToDuplicate,
      i: generateWidgetId(),
      title: `${widgetToDuplicate.title || widgetToDuplicate.type} (Copy)`,
      x: 0, // Will be repositioned by findNextAvailablePosition
      y: 0
    }

    // Find a new position for the duplicated widget
    const position = findNextAvailablePosition(widgets, {
      w: duplicatedWidget.w,
      h: duplicatedWidget.h
    }, gridCols, maxRows)
    
    duplicatedWidget.x = position.x
    duplicatedWidget.y = position.y

    setWidgets(prev => [...prev, duplicatedWidget])
    setSelectedWidget(duplicatedWidget)
    return duplicatedWidget
  }, [widgets, gridCols, maxRows])

  // Handle layout changes from React-Grid-Layout
  const onLayoutChange = useCallback((layout, layouts) => {
    setLayouts(layouts)
    
    // Update widget positions
    setWidgets(prev => prev.map(widget => {
      const layoutItem = layout.find(item => item.i === widget.i)
      if (layoutItem) {
        return {
          ...widget,
          x: layoutItem.x,
          y: layoutItem.y,
          w: layoutItem.w,
          h: layoutItem.h
        }
      }
      return widget
    }))
  }, [])

  // Move widget to a specific position
  const moveWidget = useCallback((widgetId, newPosition) => {
    const { x, y } = newPosition
    updateWidget(widgetId, { x, y })
  }, [updateWidget])

  // Resize widget
  const resizeWidget = useCallback((widgetId, newSize) => {
    const { w, h } = newSize
    updateWidget(widgetId, { w, h })
  }, [updateWidget])

  // Clear all widgets
  const clearWidgets = useCallback(() => {
    setWidgets([])
    setSelectedWidget(null)
    setOverlaps([])
  }, [])

  // Reset widgets to initial state
  const resetWidgets = useCallback(() => {
    setWidgets(initialWidgets)
    setSelectedWidget(null)
    setOverlaps([])
  }, [initialWidgets])

  // Get widget by ID
  const getWidget = useCallback((widgetId) => {
    return widgets.find(w => w.i === widgetId)
  }, [widgets])

  // Get all widgets of a specific type
  const getWidgetsByType = useCallback((widgetType) => {
    return widgets.filter(w => w.type === widgetType)
  }, [widgets])

  // Check if a position is available
  const isPositionAvailable = useCallback((x, y, w, h, excludeWidgetId = null) => {
    const testWidget = { x, y, w, h, i: 'test' }
    const otherWidgets = widgets.filter(w => w.i !== excludeWidgetId)
    
    return !otherWidgets.some(widget => 
      validateWidgetPositions([testWidget, widget]).length > 0
    )
  }, [widgets])

  // Get grid statistics
  const getGridStats = useCallback(() => {
    return {
      totalWidgets: widgets.length,
      overlaps: overlaps.length,
      isValidating,
      widgetTypes: [...new Set(widgets.map(w => w.type))],
      gridUtilization: widgets.length / (gridCols * maxRows) * 100
    }
  }, [widgets, overlaps, isValidating, gridCols, maxRows])

  // Manual validation trigger
  const validateLayout = useCallback(() => {
    const detectedOverlaps = validateWidgetPositions(widgets)
    setOverlaps(detectedOverlaps)
    return detectedOverlaps
  }, [widgets])

  // Auto-fix overlaps manually
  const fixOverlaps = useCallback(() => {
    if (overlaps.length > 0) {
      const fixedWidgets = autoFixOverlaps(widgets, gridCols)
      setWidgets(fixedWidgets)
      setOverlaps([])
      return true
    }
    return false
  }, [widgets, overlaps, gridCols])

  return {
    // State
    widgets,
    layouts,
    selectedWidget,
    overlaps,
    isValidating,
    
    // Actions
    addWidget,
    removeWidget,
    updateWidget,
    duplicateWidget,
    moveWidget,
    resizeWidget,
    clearWidgets,
    resetWidgets,
    
    // Selection
    setSelectedWidget,
    getWidget,
    getWidgetsByType,
    
    // Layout
    onLayoutChange,
    
    // Validation
    validateLayout,
    fixOverlaps,
    isPositionAvailable,
    
    // Statistics
    getGridStats
  }
}
