import React, { useState, useCallback } from 'react'
import { 
  Gauge,
  BarChart3,
  ToggleLeft,
  Sliders,
  MapPin,
  Box,
  Bell,
  Thermometer,
  Search,
  Filter,
  Grid3X3,
  List,
  Plus
} from 'lucide-react'

/**
 * Widget Palette Component with drag-and-drop support
 * @param {Object} props - Component props
 * @param {Array} props.widgetTypes - Available widget types
 * @param {Function} props.onWidgetAdd - Callback when widget is added
 * @param {string} props.searchTerm - Search term for filtering
 * @param {Function} props.onSearchChange - Search change callback
 * @param {string} props.viewMode - View mode ('grid' or 'list')
 * @param {Function} props.onViewModeChange - View mode change callback
 * @param {Object} props.className - Additional CSS classes
 */
export const WidgetPalette = ({
  widgetTypes = [],
  onWidgetAdd,
  searchTerm = '',
  onSearchChange,
  viewMode = 'grid',
  onViewModeChange,
  className = '',
  ...props
}) => {
  const [draggedWidget, setDraggedWidget] = useState(null)

  // Default widget types if none provided
  const defaultWidgetTypes = [
    { type: 'gauge', name: 'Gauge', icon: Gauge, color: 'bg-blue-500', bgClass: 'bg-blue-100', textClass: 'text-blue-600', description: 'Display sensor values with visual gauges' },
    { type: 'chart', name: 'Chart', icon: BarChart3, color: 'bg-red-500', bgClass: 'bg-red-100', textClass: 'text-red-600', description: 'Visualize data with various chart types' },
    { type: 'toggle', name: 'Toggle', icon: ToggleLeft, color: 'bg-purple-500', bgClass: 'bg-purple-100', textClass: 'text-purple-600', description: 'Control devices with toggle switches' },
    { type: 'slider', name: 'Slider', icon: Sliders, color: 'bg-orange-500', bgClass: 'bg-orange-100', textClass: 'text-orange-600', description: 'Adjust values with range sliders' },
    { type: 'map', name: 'Map', icon: MapPin, color: 'bg-red-500', bgClass: 'bg-red-100', textClass: 'text-red-600', description: 'Show device locations on maps' },
    { type: '3d-model', name: '3D Model', icon: Box, color: 'bg-indigo-500', bgClass: 'bg-indigo-100', textClass: 'text-indigo-600', description: 'Display 3D device models' },
    { type: 'notification', name: 'Notification', icon: Bell, color: 'bg-yellow-500', bgClass: 'bg-yellow-100', textClass: 'text-yellow-600', description: 'Show system notifications' },
    { type: 'sensor-tile', name: 'Sensor Tile', icon: Thermometer, color: 'bg-teal-500', bgClass: 'bg-teal-100', textClass: 'text-teal-600', description: 'Compact sensor data display' }
  ]

  const availableWidgets = widgetTypes.length > 0 ? widgetTypes : defaultWidgetTypes

  // Filter widgets based on search term
  const filteredWidgets = availableWidgets.filter(widget =>
    widget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    widget.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (widget.description && widget.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Widget click handler
  const handleWidgetClick = useCallback((widgetType) => {
    console.log('Widget clicked (fallback):', widgetType)
    if (onWidgetAdd && widgetType) {
      onWidgetAdd(widgetType)
    }
  }, [onWidgetAdd])

  // Drag start handler - OPTIMIZED FOR REACT GRID LAYOUT
  const handleDragStart = useCallback((e, widgetType) => {
    console.log('Drag start:', widgetType)
    setDraggedWidget(widgetType)
    
    // Set data for React Grid Layout
    e.dataTransfer.effectAllowed = 'copy'
    e.dataTransfer.setData('text/plain', widgetType)
    
    // Set global variable - this is what RGL onDrop uses
    window.draggedWidgetType = widgetType
    
    console.log('Drag data set for RGL:', {
      widgetType,
      global: window.draggedWidgetType,
      effectAllowed: e.dataTransfer.effectAllowed
    })
  }, [])

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setDraggedWidget(null)
  }, [])

  // Widget preview components
  const WidgetPreview = ({ widgetType }) => {
    switch (widgetType.type) {
      case 'gauge':
        return (
          <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center relative overflow-hidden">
            <div className="w-8 h-8 border-4 border-blue-200 rounded-full relative">
              <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent transform rotate-45"></div>
              <div className="absolute inset-2 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">50</span>
              </div>
            </div>
          </div>
        )
      case 'chart':
        return (
          <div className="w-12 h-12 bg-gradient-to-br from-green-50 to-green-100 rounded-lg flex items-center justify-center relative overflow-hidden">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
              <path d="M3 12L7 8L11 12L15 6L21 12V20H3V12Z" stroke="#10b981" strokeWidth="2" fill="none"/>
              <circle cx="3" cy="12" r="1.5" fill="#10b981"/>
              <circle cx="7" cy="8" r="1.5" fill="#10b981"/>
              <circle cx="11" cy="12" r="1.5" fill="#10b981"/>
              <circle cx="15" cy="6" r="1.5" fill="#10b981"/>
              <circle cx="21" cy="12" r="1.5" fill="#10b981"/>
            </svg>
          </div>
        )
      case 'toggle':
        return (
          <div className="w-12 h-12 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg flex items-center justify-center">
            <div className="w-8 h-4 bg-purple-200 rounded-full relative">
              <div className="w-3 h-3 bg-purple-500 rounded-full absolute top-0.5 right-0.5 transition-transform"></div>
            </div>
          </div>
        )
      case 'slider':
        return (
          <div className="w-12 h-12 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg flex items-center justify-center">
            <div className="w-8 h-1 bg-orange-200 rounded-full relative">
              <div className="w-3 h-3 bg-orange-500 rounded-full absolute -top-1 left-1/2 transform -translate-x-1/2"></div>
            </div>
          </div>
        )
      case 'map':
        return (
          <div className="w-12 h-12 bg-gradient-to-br from-red-50 to-red-100 rounded-lg flex items-center justify-center relative overflow-hidden">
            <div className="w-8 h-8 bg-red-200 rounded relative">
              <div className="absolute inset-1 bg-red-300 rounded-sm"></div>
              <div className="absolute top-1 left-1 w-1 h-1 bg-red-500 rounded-full"></div>
              <div className="absolute bottom-1 right-1 w-1 h-1 bg-red-500 rounded-full"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0.5 h-0.5 bg-red-600 rounded-full"></div>
            </div>
          </div>
        )
      case '3d-model':
        return (
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg flex items-center justify-center">
            <div className="w-6 h-6 bg-indigo-300 transform rotate-12 relative">
              <div className="absolute inset-0 bg-indigo-400 transform translate-x-1 translate-y-1"></div>
              <div className="absolute inset-0 bg-indigo-500 transform translate-x-2 translate-y-2"></div>
            </div>
          </div>
        )
      case 'notification':
        return (
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg flex items-center justify-center relative">
            <Bell className="w-6 h-6 text-yellow-600" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">3</span>
            </div>
          </div>
        )
      case 'sensor-tile':
        return (
          <div className="w-12 h-12 bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg flex items-center justify-center">
            <div className="w-8 h-8 bg-teal-200 rounded-lg flex flex-col items-center justify-center">
              <div className="w-4 h-0.5 bg-teal-500 mb-1"></div>
              <div className="w-3 h-0.5 bg-teal-500 mb-1"></div>
              <div className="w-2 h-0.5 bg-teal-500"></div>
            </div>
          </div>
        )
      default:
        return (
          <div className="w-12 h-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center">
            <Box className="w-6 h-6 text-gray-500" />
          </div>
        )
    }
  }

  return (
    <div className={`widget-palette h-full flex flex-col ${className}`} {...props}>
      {/* Fixed Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Widgets</h3>
          <p className="text-sm text-gray-600">Click or drag widgets to your dashboard</p>
        </div>
        
        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search widgets..."
              value={searchTerm}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
            />
          </div>
        </div>
      </div>

      {/* Scrollable Widget Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 gap-3">
          {filteredWidgets.map((widgetType) => {
            const isDragging = draggedWidget === widgetType.type
            
            return (
              <div
                key={widgetType.type}
                draggable
                onDragStart={(e) => handleDragStart(e, widgetType.type)}
                onDragEnd={handleDragEnd}
                onClick={() => handleWidgetClick(widgetType.type)}
                className={`
                  group relative bg-white border border-gray-200 rounded-xl p-4
                  hover:border-red-300 hover:shadow-lg cursor-grab transition-all duration-200
                  ${isDragging ? 'opacity-50 scale-95 cursor-grabbing' : 'hover:scale-[1.02]'}
                `}
              >
                {/* Widget Preview */}
                <div className="flex items-center space-x-3 mb-3">
                  <WidgetPreview widgetType={widgetType} />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm">{widgetType.name}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">Click or drag to add</p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className="w-4 h-4 text-red-600" />
                  </div>
                </div>
                
                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
            )
          })}
        </div>

        {/* No Results */}
        {filteredWidgets.length === 0 && (
          <div className="text-center py-8">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-medium">No widgets found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your search term</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default WidgetPalette
