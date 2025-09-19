import React, { useState, useCallback } from 'react'
import { 
  Gauge, 
  BarChart3, 
  ToggleLeft, 
  Sliders, 
  Map, 
  Bell, 
  Activity,
  Box
} from 'lucide-react'

/**
 * Professional Widget Palette
 * Clean, modern widget selection interface
 */
export const ProfessionalWidgetPalette = ({
  onWidgetClick,
  isMobile = false,
  isTablet = false,
  className = '',
  style = {}
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Widget categories and items
  const widgetCategories = {
    all: {
      name: 'All Widgets',
      widgets: [
        { type: 'gauge', name: 'Gauge', icon: Gauge, description: 'Display values with visual indicators' },
        { type: 'chart', name: 'Chart', icon: BarChart3, description: 'Data visualization and analytics' },
        { type: 'toggle', name: 'Toggle', icon: ToggleLeft, description: 'On/off control switches' },
        { type: 'slider', name: 'Slider', icon: Sliders, description: 'Range and value controls' },
        { type: 'map', name: 'Map', icon: Map, description: 'Geographic data visualization' },
        { type: 'notification', name: 'Notification', icon: Bell, description: 'Alerts and messages' },
        { type: 'sensor-tile', name: 'Sensor Tile', icon: Activity, description: 'Sensor data display' },
        { type: '3d-model', name: '3D Model', icon: Box, description: '3D object visualization' }
      ]
    },
    controls: {
      name: 'Controls',
      widgets: [
        { type: 'toggle', name: 'Toggle', icon: ToggleLeft, description: 'On/off control switches' },
        { type: 'slider', name: 'Slider', icon: Sliders, description: 'Range and value controls' }
      ]
    },
    visualization: {
      name: 'Visualization',
      widgets: [
        { type: 'gauge', name: 'Gauge', icon: Gauge, description: 'Display values with visual indicators' },
        { type: 'chart', name: 'Chart', icon: BarChart3, description: 'Data visualization and analytics' },
        { type: 'map', name: 'Map', icon: Map, description: 'Geographic data visualization' },
        { type: '3d-model', name: '3D Model', icon: Box, description: '3D object visualization' }
      ]
    },
    data: {
      name: 'Data',
      widgets: [
        { type: 'sensor-tile', name: 'Sensor Tile', icon: Activity, description: 'Sensor data display' },
        { type: 'notification', name: 'Notification', icon: Bell, description: 'Alerts and messages' }
      ]
    }
  }

  // Filter widgets based on search and category
  const filteredWidgets = widgetCategories[selectedCategory]?.widgets.filter(widget =>
    widget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    widget.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  // Handle widget click
  const handleWidgetClick = useCallback((widgetType) => {
    if (onWidgetClick) {
      onWidgetClick(widgetType)
    }
  }, [onWidgetClick])

  // Handle drag start
  const handleDragStart = useCallback((e, widgetType) => {
    e.dataTransfer.effectAllowed = 'copy'
    e.dataTransfer.setData('text/plain', widgetType)
    
    // Add visual feedback
    e.target.style.opacity = '0.7'
    e.target.style.transform = 'scale(0.95)'
  }, [])

  // Handle drag end
  const handleDragEnd = useCallback((e) => {
    e.target.style.opacity = '1'
    e.target.style.transform = 'scale(1)'
  }, [])

  return (
    <div className={`professional-widget-palette ${isMobile ? 'mobile-palette' : isTablet ? 'tablet-palette' : 'desktop-palette'} ${className}`} style={style}>
      {/* Header - Hidden on mobile, simplified on tablet */}
      {!isMobile && (
        <div className={`palette-header ${isTablet ? 'tablet-header' : ''}`}>
          <h3>Widgets</h3>
          {!isTablet && <p className="palette-subtitle">Click or drag widgets to your dashboard</p>}
        </div>
      )}

      {/* Search - Simplified on mobile and tablet */}
      <div className="palette-search">
        <input
          type="text"
          placeholder={isMobile ? "Search..." : isTablet ? "Search..." : "Search widgets..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`search-input ${isMobile ? 'mobile-search' : isTablet ? 'tablet-search' : ''}`}
        />
      </div>

      {/* Categories - Horizontal scroll on mobile and tablet */}
      <div className={`palette-categories ${isMobile ? 'mobile-categories' : isTablet ? 'tablet-categories' : ''}`}>
        {Object.entries(widgetCategories).map(([key, category]) => (
          <button
            key={key}
            className={`category-btn ${selectedCategory === key ? 'active' : ''} ${isMobile ? 'mobile-category' : isTablet ? 'tablet-category' : ''}`}
            onClick={() => setSelectedCategory(key)}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Widgets Grid - Responsive layout */}
      <div className={`widgets-grid ${isMobile ? 'mobile-widgets-grid' : isTablet ? 'tablet-widgets-grid' : 'desktop-widgets-grid'}`}>
        {filteredWidgets.map((widget) => {
          const IconComponent = widget.icon
          return (
            <div
              key={widget.type}
              className={`widget-item ${isMobile ? 'mobile-widget-item' : isTablet ? 'tablet-widget-item' : 'desktop-widget-item'}`}
              draggable={!isMobile}
              onDragStart={!isMobile ? (e) => handleDragStart(e, widget.type) : undefined}
              onDragEnd={!isMobile ? handleDragEnd : undefined}
              onClick={() => handleWidgetClick(widget.type)}
              title={widget.description}
            >
              <div className="widget-icon">
                <IconComponent size={isMobile ? 20 : isTablet ? 22 : 24} />
              </div>
              <div className="widget-info">
                <span className="widget-name">{widget.name}</span>
                {!isMobile && !isTablet && <span className="widget-description">{widget.description}</span>}
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredWidgets.length === 0 && (
        <div className="palette-empty">
          <div className="empty-icon">🔍</div>
          <p>No widgets found</p>
          {!isMobile && !isTablet && <span>Try adjusting your search or category</span>}
        </div>
      )}
    </div>
  )
}

export default ProfessionalWidgetPalette
