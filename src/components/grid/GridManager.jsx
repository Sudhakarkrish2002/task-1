import React, { useState, useCallback, useEffect, forwardRef } from 'react'
import { Save, Eye, Settings, RotateCcw } from 'lucide-react'
import { EnhancedGridLayout } from './EnhancedGridLayout'
import { WidgetPalette } from './WidgetPalette'
import { useGridLayout } from '../../hooks/useGridLayout'
import { Button } from '../ui/button'

/**
 * Comprehensive Grid Manager Component
 * Combines widget palette, grid layout, and management features
 * @param {Object} props - Component props
 * @param {Array} props.initialWidgets - Initial widgets
 * @param {Function} props.renderWidget - Widget render function
 * @param {Function} props.onSave - Save callback
 * @param {string} props.title - Grid title
 * @param {boolean} props.showPalette - Show widget palette
 * @param {boolean} props.showToolbar - Show toolbar
 * @param {Object} props.className - Additional CSS classes
 */
export const GridManager = forwardRef(({
  initialWidgets = [],
  initialLayouts = {},
  renderWidget,
  onSave,
  onWidgetSettings,
  title = "Dashboard",
  showPalette = true,
  showToolbar = true,
  widgetTypes = [],
  className = '',
  isSharedMode = false,
  ...props
}, ref) => {
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('grid')

  // Use the grid layout hook
  const {
    widgets,
    layouts,
    overlaps,
    isValidating,
    addWidget,
    removeWidget,
    updateWidget,
    duplicateWidget,
    clearWidgets,
    resetWidgets,
    validateLayout,
    fixOverlaps,
    getGridStats
  } = useGridLayout({
    initialWidgets,
    initialLayouts,
    enableOverlapPrevention: true,
    enableAutoFix: true,
    debounceMs: 300
  })

  // Widget addition handler
  const handleWidgetAdd = useCallback((widgetType) => {
    if (widgetType) {
      addWidget(widgetType)
    }
  }, [addWidget])

  // Handle layout changes
  const handleLayoutChange = useCallback((layout, layouts) => {
    // Layout changes are handled by the hook
  }, [])

  // Handle save
  const handleSave = useCallback(() => {
    console.log('GridManager handleSave called')
    console.log('Current widgets:', widgets)
    console.log('Current layouts:', layouts)
    
    if (onSave) {
      const saveData = {
        widgets,
        layouts,
        title,
        stats: getGridStats()
      }
      console.log('Saving data:', saveData)
      onSave(saveData)
    } else {
      console.warn('No onSave function provided to GridManager')
    }
  }, [widgets, layouts, title, getGridStats, onSave])



  // Get grid statistics
  const gridStats = getGridStats()

  // Listen for save trigger from top bar
  useEffect(() => {
    const handleSaveTrigger = (event) => {
      console.log('Save event received in GridManager')
      // Use callback from event detail if provided, otherwise use default handleSave
      const callback = event.detail?.callback
      if (callback) {
        const saveData = {
          widgets,
          layouts,
          title,
          stats: getGridStats()
        }
        console.log('Saving data with custom callback:', saveData)
        callback(saveData)
      } else {
        handleSave()
      }
    }

    window.addEventListener('gridManagerSave', handleSaveTrigger)
    return () => window.removeEventListener('gridManagerSave', handleSaveTrigger)
  }, [handleSave, widgets, layouts, title, getGridStats])

  // Listen for widget update events
  useEffect(() => {
    const handleWidgetUpdate = (event) => {
      const { widgetId, updates } = event.detail
      if (widgetId && updates) {
        updateWidget(widgetId, updates)
      }
    }

    window.addEventListener('updateGridWidget', handleWidgetUpdate)
    return () => window.removeEventListener('updateGridWidget', handleWidgetUpdate)
  }, [updateWidget])

  return (
    <div className={`grid-manager min-h-screen bg-gray-50 ${className}`} {...props}>
      {/* Header */}
      {showToolbar && (
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h1>
              <div className="flex flex-wrap items-center gap-2 sm:gap-0 sm:space-x-2 text-xs sm:text-sm text-gray-600">
                <span>Widgets: {gridStats.totalWidgets}</span>
                <span className="hidden sm:inline">•</span>
                <span>Utilization: {gridStats.gridUtilization.toFixed(1)}%</span>
                {overlaps.length > 0 && (
                  <>
                    <span className="hidden sm:inline">•</span>
                    <span className="text-red-600 font-medium">{overlaps.length} Overlap{overlaps.length > 1 ? 's' : ''}</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {overlaps.length > 0 && (
                <Button
                  onClick={fixOverlaps}
                  variant="outline"
                  size="sm"
                  className="text-orange-600 border-orange-300 hover:bg-orange-50 text-xs sm:text-sm"
                >
                  <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Fix Overlaps</span>
                  <span className="sm:hidden">Fix</span>
                </Button>
              )}
              
              <Button
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                variant={isPreviewMode ? "default" : "outline"}
                size="sm"
                className="text-xs sm:text-sm"
              >
                <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{isPreviewMode ? 'Edit Mode' : 'Preview Mode'}</span>
                <span className="sm:hidden">{isPreviewMode ? 'Edit' : 'Preview'}</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row h-[calc(100vh-120px)]">
        {/* Widget Palette - Hidden in shared mode */}
        {showPalette && !isSharedMode && (
          <div className="w-full lg:w-72 bg-white border-b lg:border-b-0 lg:border-r border-gray-200 shadow-sm overflow-hidden">
            <WidgetPalette
              widgetTypes={widgetTypes}
              onWidgetAdd={handleWidgetAdd}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </div>
        )}

        {/* Main Grid Area */}
        <div className="flex-1 overflow-hidden">
          <EnhancedGridLayout
            widgets={widgets}
            layouts={layouts}
            overlaps={overlaps}
            isValidating={isValidating}
            renderWidget={renderWidget}
            isPreviewMode={isPreviewMode || isSharedMode}
            onLayoutChange={isSharedMode ? () => {} : handleLayoutChange}
            onWidgetDelete={isSharedMode ? () => {} : removeWidget}
            onWidgetCopy={isSharedMode ? () => {} : duplicateWidget}
            onWidgetAdd={isSharedMode ? () => {} : handleWidgetAdd}
            onWidgetSettings={isSharedMode ? () => {} : onWidgetSettings}
            showGridBackground={!isPreviewMode && !isSharedMode}
            showStatusBar={false}
            enableAutoFix={!isSharedMode}
            className="h-full"
          />
        </div>

      </div>

    </div>
  )
})

GridManager.displayName = 'GridManager'

export default GridManager
