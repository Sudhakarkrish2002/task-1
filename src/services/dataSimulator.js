import mqttService from './mqttService'

/**
 * Data Simulator Service
 * Simulates IoT device data for testing and demonstration purposes
 */
class DataSimulator {
  constructor() {
    this.isRunning = false
    this.intervals = new Map()
    this.panels = new Map()
  }

  /**
   * Start simulating data for a panel
   * @param {string} panelId - Panel ID to simulate data for
   * @param {Array} widgets - Array of widgets to simulate data for
   */
  startPanelSimulation(panelId, widgets = []) {
    if (!panelId) {
      console.error('❌ Panel ID is required for simulation')
      return false
    }

    console.log(`🚀 Starting data simulation for panel: ${panelId}`)
    console.log(`📊 Widgets to simulate:`, widgets)

    // Store panel configuration
    this.panels.set(panelId, {
      widgets: widgets,
      lastUpdate: Date.now()
    })

    // Start simulation for each widget
    widgets.forEach(widget => {
      this.startWidgetSimulation(panelId, widget)
    })

    this.isRunning = true
    return true
  }

  /**
   * Start simulating data for a specific widget
   * @param {string} panelId - Panel ID
   * @param {Object} widget - Widget configuration
   */
  startWidgetSimulation(panelId, widget) {
    const widgetId = widget.id
    const widgetType = widget.type
    const interval = this.getSimulationInterval(widgetType)

    console.log(`🎯 Starting simulation for widget ${widgetId} (${widgetType})`)

    // Clear existing interval if any
    if (this.intervals.has(widgetId)) {
      clearInterval(this.intervals.get(widgetId))
    }

    // Create simulation interval
    const intervalId = setInterval(() => {
      this.simulateWidgetData(panelId, widget)
    }, interval)

    this.intervals.set(widgetId, intervalId)
  }

  /**
   * Get simulation interval based on widget type
   * @param {string} widgetType - Type of widget
   * @returns {number} Interval in milliseconds
   */
  getSimulationInterval(widgetType) {
    switch (widgetType) {
      case 'gauge':
      case 'sensor-tile':
        return 2000 // 2 seconds
      case 'chart':
        return 1000 // 1 second
      case 'toggle':
        return 5000 // 5 seconds
      case 'notification':
        return 10000 // 10 seconds
      default:
        return 3000 // 3 seconds
    }
  }

  /**
   * Simulate data for a specific widget
   * @param {string} panelId - Panel ID
   * @param {Object} widget - Widget configuration
   */
  simulateWidgetData(panelId, widget) {
    const widgetId = widget.id
    const widgetType = widget.type
    let simulatedData = {}

    // Generate data based on widget type
    switch (widgetType) {
      case 'gauge':
        simulatedData = {
          value: this.generateGaugeValue(widget),
          timestamp: new Date().toISOString(),
          unit: widget.unit || '%'
        }
        break

      case 'sensor-tile':
        simulatedData = {
          value: this.generateSensorValue(widget),
          timestamp: new Date().toISOString(),
          unit: widget.unit || '°C',
          status: this.generateSensorStatus()
        }
        break

      case 'chart':
        simulatedData = {
          value: this.generateChartValue(widget),
          timestamp: new Date().toISOString(),
          history: this.generateChartHistory(widget)
        }
        break

      case 'toggle':
        simulatedData = {
          isOn: this.generateToggleState(widget),
          timestamp: new Date().toISOString(),
          power: this.generatePowerValue()
        }
        break

      case 'notification':
        simulatedData = {
          title: this.generateNotificationTitle(),
          message: this.generateNotificationMessage(),
          type: this.generateNotificationType(),
          timestamp: new Date().toISOString()
        }
        break

      default:
        simulatedData = {
          value: Math.floor(Math.random() * 100),
          timestamp: new Date().toISOString()
        }
    }

    // Publish data to MQTT
    this.publishWidgetData(panelId, widgetId, simulatedData)
  }

  /**
   * Generate gauge value
   * @param {Object} widget - Widget configuration
   * @returns {number} Gauge value
   */
  generateGaugeValue(widget) {
    const min = widget.minValue || widget.min || 0
    const max = widget.maxValue || widget.max || 100
    const baseValue = (min + max) / 2
    const variation = (max - min) * 0.2
    return Math.floor(baseValue + (Math.random() - 0.5) * variation)
  }

  /**
   * Generate sensor value
   * @param {Object} widget - Widget configuration
   * @returns {number} Sensor value
   */
  generateSensorValue(widget) {
    const min = widget.minValue || widget.min || 0
    const max = widget.maxValue || widget.max || 100
    return Math.floor(min + Math.random() * (max - min))
  }

  /**
   * Generate sensor status
   * @returns {string} Sensor status
   */
  generateSensorStatus() {
    const statuses = ['normal', 'warning', 'critical']
    return statuses[Math.floor(Math.random() * statuses.length)]
  }

  /**
   * Generate chart value
   * @param {Object} widget - Widget configuration
   * @returns {number} Chart value
   */
  generateChartValue(widget) {
    const min = widget.minValue || widget.min || 0
    const max = widget.maxValue || widget.max || 100
    return Math.floor(min + Math.random() * (max - min))
  }

  /**
   * Generate chart history
   * @param {Object} widget - Widget configuration
   * @returns {Array} Chart history data
   */
  generateChartHistory(widget) {
    const history = []
    const now = Date.now()
    const min = widget.minValue || widget.min || 0
    const max = widget.maxValue || widget.max || 100

    for (let i = 9; i >= 0; i--) {
      history.push({
        timestamp: new Date(now - i * 1000).toISOString(),
        value: Math.floor(min + Math.random() * (max - min))
      })
    }

    return history
  }

  /**
   * Generate toggle state
   * @param {Object} widget - Widget configuration
   * @returns {boolean} Toggle state
   */
  generateToggleState(widget) {
    // 80% chance to maintain current state, 20% chance to change
    return Math.random() > 0.2 ? (widget.isOn || false) : !(widget.isOn || false)
  }

  /**
   * Generate power value
   * @returns {number} Power value
   */
  generatePowerValue() {
    return Math.floor(Math.random() * 100)
  }

  /**
   * Generate notification title
   * @returns {string} Notification title
   */
  generateNotificationTitle() {
    const titles = [
      'System Alert',
      'Device Status',
      'Temperature Warning',
      'Power Update',
      'Connection Status'
    ]
    return titles[Math.floor(Math.random() * titles.length)]
  }

  /**
   * Generate notification message
   * @returns {string} Notification message
   */
  generateNotificationMessage() {
    const messages = [
      'Device operating normally',
      'Temperature within acceptable range',
      'Power consumption optimized',
      'Connection stable',
      'System performance good'
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }

  /**
   * Generate notification type
   * @returns {string} Notification type
   */
  generateNotificationType() {
    const types = ['info', 'warning', 'success', 'error']
    return types[Math.floor(Math.random() * types.length)]
  }

  /**
   * Publish widget data to MQTT
   * @param {string} panelId - Panel ID
   * @param {string} widgetId - Widget ID
   * @param {Object} data - Data to publish
   */
  publishWidgetData(panelId, widgetId, data) {
    try {
      // Create panel data format: {widget_id: data}
      const panelData = {
        [widgetId]: data
      }

      // Publish to MQTT
      const success = mqttService.publishToPanel(panelId, widgetId, data)
      
      if (success) {
        console.log(`📤 Published data for widget ${widgetId}:`, data)
      } else {
        console.warn(`⚠️ Failed to publish data for widget ${widgetId}`)
      }
    } catch (error) {
      console.error(`❌ Error publishing data for widget ${widgetId}:`, error)
    }
  }

  /**
   * Stop simulation for a specific widget
   * @param {string} widgetId - Widget ID
   */
  stopWidgetSimulation(widgetId) {
    if (this.intervals.has(widgetId)) {
      clearInterval(this.intervals.get(widgetId))
      this.intervals.delete(widgetId)
      console.log(`🛑 Stopped simulation for widget: ${widgetId}`)
    }
  }

  /**
   * Stop simulation for a panel
   * @param {string} panelId - Panel ID
   */
  stopPanelSimulation(panelId) {
    const panel = this.panels.get(panelId)
    if (panel) {
      panel.widgets.forEach(widget => {
        this.stopWidgetSimulation(widget.id)
      })
      this.panels.delete(panelId)
      console.log(`🛑 Stopped simulation for panel: ${panelId}`)
    }
  }

  /**
   * Stop all simulations
   */
  stopAllSimulations() {
    this.intervals.forEach((intervalId, widgetId) => {
      clearInterval(intervalId)
    })
    this.intervals.clear()
    this.panels.clear()
    this.isRunning = false
    console.log('🛑 Stopped all data simulations')
  }

  /**
   * Get simulation status
   * @returns {Object} Simulation status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      activePanels: Array.from(this.panels.keys()),
      activeWidgets: Array.from(this.intervals.keys()),
      totalSimulations: this.intervals.size
    }
  }
}

// Create singleton instance
const dataSimulator = new DataSimulator()

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  window.dataSimulator = dataSimulator
}

export default dataSimulator
