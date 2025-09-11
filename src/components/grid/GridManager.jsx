import React, { useState, useCallback, useRef } from 'react'
import { Save, Eye, Settings, RotateCcw, Download, Upload } from 'lucide-react'
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
 * @param {Function} props.onExport - Export callback
 * @param {Function} props.onImport - Import callback
 * @param {string} props.title - Grid title
 * @param {boolean} props.showPalette - Show widget palette
 * @param {boolean} props.showToolbar - Show toolbar
 * @param {Object} props.className - Additional CSS classes
 */
export const GridManager = ({
  initialWidgets = [],
  initialLayouts = {},
  renderWidget,
  onSave,
  onExport,
  onImport,
  onWidgetSettings,
  title = "Dashboard",
  showPalette = true,
  showToolbar = true,
  widgetTypes = [],
  className = '',
  ...props
}) => {
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const fileInputRef = useRef(null)

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

  // Handle widget addition
  const handleWidgetAdd = useCallback((widgetType) => {
    const newWidget = addWidget(widgetType)
  }, [addWidget])

  // Handle layout changes
  const handleLayoutChange = useCallback((layout, layouts) => {
    // Layout changes are handled by the hook
  }, [])

  // Handle save
  const handleSave = useCallback(() => {
    if (onSave) {
      const saveData = {
        widgets,
        layouts,
        title,
        stats: getGridStats()
      }
      onSave(saveData)
    } else {
      console.warn('No onSave function provided to GridManager')
    }
  }, [widgets, layouts, title, getGridStats, onSave])

  // Handle export
  const handleExport = useCallback(() => {
    if (onExport) {
      onExport({
        widgets,
        layouts,
        title,
        stats: getGridStats()
      })
    } else {
      // Default export to JSON
      const data = {
        widgets,
        layouts,
        title,
        stats: getGridStats(),
        exportedAt: new Date().toISOString()
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title.toLowerCase().replace(/\s+/g, '-')}-dashboard.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }, [widgets, layouts, title, getGridStats, onExport])

  // Handle import
  const handleImport = useCallback((event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        if (onImport) {
          onImport(data)
        } else {
          // Default import behavior
          if (data.widgets) {
            clearWidgets()
            data.widgets.forEach(widget => addWidget(widget.type, widget))
          }
        }
      } catch (error) {
        console.error('Error importing file:', error)
        alert('Error importing file. Please check the file format.')
      }
    }
    reader.readAsText(file)
  }, [onImport, clearWidgets, addWidget])

  // Get grid statistics
  const gridStats = getGridStats()

  return (
    <div className={`grid-manager min-h-screen bg-gray-50 ${className}`} {...props}>
      {/* Header */}
      {showToolbar && (
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Widgets: {gridStats.totalWidgets}</span>
                <span>•</span>
                <span>Utilization: {gridStats.gridUtilization.toFixed(1)}%</span>
                {overlaps.length > 0 && (
                  <>
                    <span>•</span>
                    <span className="text-red-600 font-medium">{overlaps.length} Overlap{overlaps.length > 1 ? 's' : ''}</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {overlaps.length > 0 && (
                <Button
                  onClick={fixOverlaps}
                  variant="outline"
                  size="sm"
                  className="text-orange-600 border-orange-300 hover:bg-orange-50"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Fix Overlaps
                </Button>
              )}
              
              <Button
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                variant={isPreviewMode ? "default" : "outline"}
                size="sm"
              >
                <Eye className="w-4 h-4 mr-2" />
                {isPreviewMode ? 'Edit Mode' : 'Preview Mode'}
              </Button>
              
              <Button
                onClick={handleExport}
                variant="outline"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                size="sm"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
              
              <Button
                onClick={handleSave}
                size="sm"
                className="bg-red-600 hover:bg-red-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex h-[calc(100vh-120px)]">
        {/* Widget Palette */}
        {showPalette && (
          <div className="w-72 bg-white border-r border-gray-200 shadow-sm overflow-hidden">
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
            isPreviewMode={isPreviewMode}
            onLayoutChange={handleLayoutChange}
            onWidgetDelete={removeWidget}
            onWidgetCopy={duplicateWidget}
            onWidgetAdd={handleWidgetAdd}
            onWidgetSettings={onWidgetSettings}
            showGridBackground={!isPreviewMode}
            showStatusBar={false}
            enableAutoFix={true}
            className="h-full"
          />
        </div>

      </div>
    </div>
  )
}

export default GridManager
