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
    maxRows = 1000, // Increased to allow more widgets at the bottom
    enableOverlapPrevention = true,
    enableAutoFix = true,
    debounceMs = 300
  } = options

  const [widgets, setWidgets] = useState(initialWidgets)
  const [layouts, setLayouts] = useState(
    Object.keys(initialLayouts).length > 0 
      ? initialLayouts 
      : {
          lg: [],
          md: [],
          sm: [],
          xs: [],
          xxs: []
        }
  )
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
    } else {
      // Initialize empty layout structure for new dashboards
      setLayouts({
        lg: [],
        md: [],
        sm: [],
        xs: [],
        xxs: []
      })
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

  // Widget addition with enhanced positioning
  const addWidget = useCallback((widgetType, widgetOptions = {}) => {
    if (!widgetType) {
      return null
    }

    // Use custom position if provided (from professional drag and drop)
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
    
    const widgetSize = getWidgetSize(widgetType)
    const newWidget = widgetOptions.position 
      ? {
          i: generateWidgetId(),
          type: widgetType,
          x: widgetOptions.position.x,
          y: widgetOptions.position.y,
          w: widgetSize.w,
          h: widgetSize.h,
          minW: widgetSize.minW || 2,
          minH: widgetSize.minH || 2,
          maxW: 12,
          maxH: 10,
          static: false,
          ...defaultSettings, // Apply default settings
          ...widgetOptions // Override with any provided options
        }
      : createWidget(widgetType, widgets, widgetOptions)
    
    setWidgets(prev => {
      const updatedWidgets = [...prev, newWidget]
      
      // Validate immediately for new widgets - ALWAYS run overlap prevention
      if (enableOverlapPrevention) {
        const detectedOverlaps = validateWidgetPositions(updatedWidgets)
        console.log('Overlap detection for new widget:', detectedOverlaps)
        
        if (detectedOverlaps.length > 0) {
          console.log('Overlaps detected, applying auto-fix')
          if (enableAutoFix) {
            const fixedWidgets = autoFixOverlaps(updatedWidgets, gridCols)
            console.log('Fixed widgets:', fixedWidgets)
            return fixedWidgets
          } else {
            console.warn('Overlaps detected but auto-fix is disabled')
          }
        } else {
          console.log('No overlaps detected')
        }
      }
      
      return updatedWidgets
    })
    
    // Update layouts to include the new widget
    setLayouts(prevLayouts => {
      const newLayouts = { ...prevLayouts }
      if (!newLayouts.lg) {
        newLayouts.lg = []
      }
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

    // Debug: Log the widget being duplicated to see its current size
    console.log('Duplicating widget:', {
      id: widgetToDuplicate.i,
      type: widgetToDuplicate.type,
      currentSize: { w: widgetToDuplicate.w, h: widgetToDuplicate.h },
      minMax: { 
        minW: widgetToDuplicate.minW, 
        minH: widgetToDuplicate.minH,
        maxW: widgetToDuplicate.maxW, 
        maxH: widgetToDuplicate.maxH 
      }
    })

    const duplicatedWidget = {
      ...widgetToDuplicate,
      i: generateWidgetId(),
      title: `${widgetToDuplicate.title || widgetToDuplicate.type} (Copy)`,
      x: 0, // Will be repositioned by findNextAvailablePosition
      y: 0,
      // Preserve the current size (w, h) and min/max constraints
      w: widgetToDuplicate.w,
      h: widgetToDuplicate.h,
      minW: widgetToDuplicate.minW,
      minH: widgetToDuplicate.minH,
      maxW: widgetToDuplicate.maxW,
      maxH: widgetToDuplicate.maxH
    }

    // Debug: Log the duplicated widget to verify size preservation
    console.log('Duplicated widget created:', {
      id: duplicatedWidget.i,
      type: duplicatedWidget.type,
      size: { w: duplicatedWidget.w, h: duplicatedWidget.h },
      minMax: { 
        minW: duplicatedWidget.minW, 
        minH: duplicatedWidget.minH,
        maxW: duplicatedWidget.maxW, 
        maxH: duplicatedWidget.maxH 
      }
    })

    // Find a new position for the duplicated widget using its current size
    const position = findNextAvailablePosition(widgets, {
      w: duplicatedWidget.w,
      h: duplicatedWidget.h
    }, gridCols, maxRows)
    
    duplicatedWidget.x = position.x
    duplicatedWidget.y = position.y

    setWidgets(prev => [...prev, duplicatedWidget])
    
    // Update layouts to include the duplicated widget
    setLayouts(prevLayouts => {
      const newLayouts = { ...prevLayouts }
      Object.keys(newLayouts).forEach(breakpoint => {
        if (!newLayouts[breakpoint]) {
          newLayouts[breakpoint] = []
        }
        const layoutItem = {
          i: duplicatedWidget.i,
          x: duplicatedWidget.x,
          y: duplicatedWidget.y,
          w: duplicatedWidget.w,
          h: duplicatedWidget.h,
          minW: duplicatedWidget.minW,
          minH: duplicatedWidget.minH,
          maxW: duplicatedWidget.maxW,
          maxH: duplicatedWidget.maxH
        }
        newLayouts[breakpoint].push(layoutItem)
        
        // Debug: Log layout update for the duplicated widget
        console.log(`Layout updated for ${breakpoint}:`, layoutItem)
      })
      return newLayouts
    })
    
    setSelectedWidget(duplicatedWidget)
    return duplicatedWidget
  }, [widgets, gridCols, maxRows])

  // Handle layout changes from React-Grid-Layout
  const onLayoutChange = useCallback((layout, layouts) => {
    setLayouts(layouts)
    
    // Update widget positions and sizes
    setWidgets(prev => {
      const updatedWidgets = prev.map(widget => {
        const layoutItem = layout.find(item => item.i === widget.i)
        if (layoutItem) {
          // Debug: Log size changes to see if resize is captured
          if (widget.w !== layoutItem.w || widget.h !== layoutItem.h) {
            console.log('Widget resize detected:', {
              id: widget.i,
              type: widget.type,
              oldSize: { w: widget.w, h: widget.h },
              newSize: { w: layoutItem.w, h: layoutItem.h }
            })
          }
          
          return {
            ...widget,
            x: layoutItem.x,
            y: layoutItem.y,
            w: layoutItem.w,
            h: layoutItem.h
          }
        }
        return widget
      })
      
      // Check for overlaps after layout changes (resize/move operations)
      if (enableOverlapPrevention) {
        const detectedOverlaps = validateWidgetPositions(updatedWidgets)
        console.log('Layout change overlap detection:', detectedOverlaps)
        
        if (detectedOverlaps.length > 0) {
          console.log('Overlaps detected after layout change, applying auto-fix')
          if (enableAutoFix) {
            const fixedWidgets = autoFixOverlaps(updatedWidgets, gridCols)
            console.log('Fixed widgets after layout change:', fixedWidgets)
            return fixedWidgets
          } else {
            console.warn('Overlaps detected after layout change but auto-fix is disabled')
          }
        } else {
          console.log('No overlaps detected after layout change')
        }
      }
      
      return updatedWidgets
    })
  }, [enableOverlapPrevention, enableAutoFix, gridCols])

  // Move widget to a specific position
  const moveWidget = useCallback((widgetId, newPosition) => {
    const { x, y } = newPosition
    updateWidget(widgetId, { x, y })
  }, [updateWidget])

  // Resize widget
  const resizeWidget = useCallback((widgetId, newSize) => {
    const { w, h } = newSize
    updateWidget(widgetId, { w, h })
    
    // Trigger overlap validation after resize
    setTimeout(() => {
      setWidgets(prev => {
        if (enableOverlapPrevention) {
          const detectedOverlaps = validateWidgetPositions(prev)
          console.log('Resize overlap detection:', detectedOverlaps)
          
          if (detectedOverlaps.length > 0 && enableAutoFix) {
            console.log('Overlaps detected after resize, applying auto-fix')
            const fixedWidgets = autoFixOverlaps(prev, gridCols)
            console.log('Fixed widgets after resize:', fixedWidgets)
            return fixedWidgets
          }
        }
        return prev
      })
    }, 100) // Small delay to ensure the resize is complete
  }, [updateWidget, enableOverlapPrevention, enableAutoFix, gridCols])

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
