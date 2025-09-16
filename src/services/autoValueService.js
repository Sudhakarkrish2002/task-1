/**
 * Professional Auto-Value Generation Service
 * Provides realistic IoT device data simulation until MQTT connection is established
 */

class AutoValueService {
  constructor() {
    this.subscribers = new Map()
    this.intervals = new Map()
    this.isEnabled = true
    this.deviceProfiles = new Map()
    this.panelContexts = new Map()
  }

  /**
   * Subscribe a widget to auto-generated values
   * @param {string} widgetId - Unique widget identifier
   * @param {string} widgetType - Type of widget
   * @param {Object} config - Widget configuration
   * @param {string} panelId - Panel identifier for context
   * @param {Function} callback - Callback function to receive new values
   */
  subscribe(widgetId, widgetType, config, panelId, callback) {
    if (this.subscribers.has(widgetId)) {
      this.unsubscribe(widgetId)
    }

    // Create device profile for realistic behavior
    const deviceProfile = this.createDeviceProfile(widgetType, config, panelId)
    this.deviceProfiles.set(widgetId, deviceProfile)

    const subscription = {
      widgetId,
      widgetType,
      config,
      panelId,
      callback,
      deviceProfile,
      lastValue: this.getInitialValue(widgetType, config, deviceProfile),
      lastUpdate: Date.now()
    }

    this.subscribers.set(widgetId, subscription)
    this.startValueGeneration(widgetId)
    
    // Return initial value immediately
    callback(subscription.lastValue, true)
  }

  /**
   * Unsubscribe a widget from auto-generated values
   * @param {string} widgetId - Widget identifier
   */
  unsubscribe(widgetId) {
    if (this.intervals.has(widgetId)) {
      clearInterval(this.intervals.get(widgetId))
      this.intervals.delete(widgetId)
    }
    this.subscribers.delete(widgetId)
    this.deviceProfiles.delete(widgetId)
  }

  /**
   * Create a realistic device profile for consistent behavior
   */
  createDeviceProfile(widgetType, config, panelId) {
    const baseProfile = {
      id: `device-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      type: widgetType,
      panelId,
      behavior: this.getBehaviorProfile(widgetType, config),
      lastMaintenance: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000, // Random within last week
      health: 0.95 + Math.random() * 0.05, // 95-100% health
      location: this.generateLocation(panelId),
      manufacturer: this.getRandomManufacturer(),
      model: this.getRandomModel(widgetType)
    }

    return baseProfile
  }

  /**
   * Get behavior profile based on widget type
   */
  getBehaviorProfile(widgetType, config) {
    const profiles = {
      gauge: {
        updateInterval: 2000 + Math.random() * 3000, // 2-5 seconds
        variation: 0.05, // 5% variation
        trendProbability: 0.15, // 15% chance to trend
        unit: config.unit || '%',
        realisticRange: this.getRealisticRange(config.unit)
      },
      chart: {
        updateInterval: 3000 + Math.random() * 2000, // 3-5 seconds
        dataPoints: 8,
        variation: 0.1,
        trendProbability: 0.2
      },
      toggle: {
        updateInterval: 8000 + Math.random() * 12000, // 8-20 seconds
        changeProbability: 0.3, // 30% chance to change
        preferredState: Math.random() > 0.5
      },
      notification: {
        updateInterval: 15000 + Math.random() * 30000, // 15-45 seconds
        maxNotifications: 5,
        types: ['info', 'warning', 'success', 'error'],
        priority: ['low', 'medium', 'high']
      },
      slider: {
        updateInterval: 4000 + Math.random() * 4000, // 4-8 seconds
        variation: 0.08,
        respectUserInput: true
      },
      sensor: {
        updateInterval: 2000 + Math.random() * 3000, // 2-5 seconds
        variation: 0.06,
        trendTracking: true,
        unit: config.unit || '°C',
        realisticRange: this.getRealisticRange(config.unit)
      },
      map: {
        updateInterval: 10000 + Math.random() * 10000, // 10-20 seconds
        deviceCount: 2 + Math.floor(Math.random() * 4), // 2-5 devices
        locationVariation: 0.001,
        statusChangeProbability: 0.1
      },
      model3d: {
        updateInterval: 100, // Smooth animation
        rotationSpeed: 1 + Math.random() * 2,
        scaleVariation: 0.02,
        autoRotateProbability: 0.7
      }
    }

    return profiles[widgetType] || profiles.gauge
  }

  /**
   * Get realistic value ranges based on unit type
   */
  getRealisticRange(unit) {
    const ranges = {
      '%': { min: 0, max: 100, normal: [20, 80] },
      '°C': { min: -10, max: 50, normal: [18, 28] },
      '°F': { min: 14, max: 122, normal: [64, 82] },
      'hPa': { min: 950, max: 1050, normal: [1000, 1020] },
      'Pa': { min: 95000, max: 105000, normal: [100000, 102000] },
      'V': { min: 0, max: 24, normal: [12, 14] },
      'A': { min: 0, max: 10, normal: [1, 5] },
      'W': { min: 0, max: 1000, normal: [100, 500] },
      'Hz': { min: 45, max: 65, normal: [49, 51] },
      'lux': { min: 0, max: 1000, normal: [200, 800] },
      'dB': { min: 30, max: 90, normal: [40, 70] },
      'ppm': { min: 0, max: 1000, normal: [300, 600] },
      'rpm': { min: 0, max: 3000, normal: [1000, 2500] }
    }

    return ranges[unit] || { min: 0, max: 100, normal: [20, 80] }
  }

  /**
   * Generate realistic location data
   */
  generateLocation(panelId) {
    const locations = [
      { name: 'Factory Floor A', lat: 37.7749, lng: -122.4194 },
      { name: 'Warehouse B', lat: 37.7849, lng: -122.4094 },
      { name: 'Office Building C', lat: 37.7649, lng: -122.4294 },
      { name: 'Data Center D', lat: 37.7549, lng: -122.4394 },
      { name: 'Research Lab E', lat: 37.7449, lng: -122.4494 }
    ]
    
    return locations[Math.floor(Math.random() * locations.length)]
  }

  /**
   * Get random manufacturer
   */
  getRandomManufacturer() {
    const manufacturers = [
      'Siemens', 'ABB', 'Schneider Electric', 'Honeywell', 'Emerson',
      'Rockwell Automation', 'Mitsubishi Electric', 'Omron', 'Bosch',
      'General Electric', 'Philips', 'Samsung', 'LG', 'Panasonic'
    ]
    return manufacturers[Math.floor(Math.random() * manufacturers.length)]
  }

  /**
   * Get random model based on widget type
   */
  getRandomModel(widgetType) {
    const models = {
      gauge: ['SG-2000', 'MG-Pro', 'AG-500', 'TG-1000'],
      chart: ['CH-3000', 'DC-Pro', 'AC-200', 'TC-1500'],
      toggle: ['TS-100', 'ST-Pro', 'AT-500', 'TT-200'],
      notification: ['NT-300', 'AN-Pro', 'TN-100', 'SN-500'],
      slider: ['SL-400', 'RS-Pro', 'AS-200', 'TS-600'],
      sensor: ['SS-1000', 'TS-Pro', 'PS-300', 'HS-800'],
      map: ['MP-2000', 'GM-Pro', 'LM-500', 'DM-1000'],
      model3d: ['3D-100', 'MD-Pro', 'TD-300', 'SD-200']
    }
    
    const typeModels = models[widgetType] || models.gauge
    return typeModels[Math.floor(Math.random() * typeModels.length)]
  }

  /**
   * Start value generation for a specific widget
   */
  startValueGeneration(widgetId) {
    const subscription = this.subscribers.get(widgetId)
    if (!subscription || !this.isEnabled) return

    const interval = setInterval(() => {
      if (!this.isEnabled) return
      
      const newValue = this.generateValue(subscription)
      subscription.lastValue = newValue
      subscription.lastUpdate = Date.now()
      subscription.callback(newValue, true)
    }, subscription.deviceProfile.behavior.updateInterval)

    this.intervals.set(widgetId, interval)
  }

  /**
   * Generate new value based on widget type and device profile
   */
  generateValue(subscription) {
    const { widgetType, config, deviceProfile, lastValue } = subscription
    const behavior = deviceProfile.behavior

    switch (widgetType) {
      case 'gauge':
      case 'sensor':
        return this.generateNumericValue(config, behavior, lastValue, deviceProfile)
      
      case 'chart':
        return this.generateChartData(behavior, lastValue)
      
      case 'toggle':
        return this.generateToggleValue(behavior, lastValue)
      
      case 'notification':
        return this.generateNotification(behavior, lastValue, deviceProfile)
      
      case 'slider':
        return this.generateSliderValue(config, behavior, lastValue)
      
      case 'map':
        return this.generateMapData(behavior, lastValue, deviceProfile)
      
      case 'model3d':
        return this.generateModel3DData(behavior, lastValue)
      
      default:
        return lastValue
    }
  }

  /**
   * Generate realistic numeric values
   */
  generateNumericValue(config, behavior, lastValue, deviceProfile) {
    const { min = 0, max = 100, unit = '' } = config
    const range = behavior.realisticRange
    const variation = behavior.variation
    
    // Simulate realistic sensor behavior
    let newValue = lastValue
    
    // Add small random variation
    const randomVariation = (Math.random() - 0.5) * (max - min) * variation
    newValue += randomVariation
    
    // Add trending behavior occasionally
    if (Math.random() < behavior.trendProbability) {
      const trendDirection = Math.random() > 0.5 ? 1 : -1
      const trendAmount = (Math.random() * 0.1 + 0.05) * (max - min) * trendDirection
      newValue += trendAmount
    }
    
    // Simulate device health effects
    if (deviceProfile.health < 0.8) {
      newValue += (Math.random() - 0.5) * (max - min) * 0.1 // More erratic when unhealthy
    }
    
    // Keep within bounds
    newValue = Math.max(min, Math.min(max, newValue))
    
    // Round based on unit type
    if (unit === '°C' || unit === '°F') {
      return Math.round(newValue * 10) / 10
    } else if (unit === 'hPa' || unit === 'Pa') {
      return Math.round(newValue * 100) / 100
    } else if (unit === 'V' || unit === 'A') {
      return Math.round(newValue * 100) / 100
    }
    
    return Math.round(newValue)
  }

  /**
   * Generate chart data
   */
  generateChartData(behavior, lastData) {
    const newValue = Math.floor(Math.random() * 100)
    return [...lastData.slice(1), newValue]
  }

  /**
   * Generate toggle value
   */
  generateToggleValue(behavior, lastValue) {
    if (Math.random() < behavior.changeProbability) {
      return !lastValue
    }
    return lastValue
  }

  /**
   * Generate notification
   */
  generateNotification(behavior, lastNotifications, deviceProfile) {
    const types = behavior.types
    const titles = [
      'Device Status Update',
      'Sensor Reading Alert',
      'System Maintenance',
      'Data Synchronization',
      'Threshold Exceeded',
      'Connection Established',
      'Battery Level Warning',
      'Temperature Alert',
      'Humidity Critical',
      'Power Consumption High',
      'Network Status Change',
      'Calibration Required'
    ]
    
    const messages = [
      `Device ${deviceProfile.model} operating normally`,
      `Temperature reading: ${(20 + Math.random() * 10).toFixed(1)}°C`,
      `Scheduled maintenance completed`,
      `Data synchronized successfully`,
      `Value exceeds normal range`,
      `Connection to ${deviceProfile.location.name} established`,
      `Battery level: ${Math.floor(20 + Math.random() * 30)}%`,
      `Temperature threshold reached`,
      `Humidity level critical`,
      `Power consumption: ${Math.floor(100 + Math.random() * 200)}W`,
      `Network connection stable`,
      `Device calibration successful`
    ]
    
    const randomType = types[Math.floor(Math.random() * types.length)]
    const randomTitle = titles[Math.floor(Math.random() * titles.length)]
    const randomMessage = messages[Math.floor(Math.random() * messages.length)]
    
    const newNotification = {
      id: Date.now().toString(),
      type: randomType,
      title: randomTitle,
      message: randomMessage,
      timestamp: new Date().toISOString(),
      read: false,
      deviceId: deviceProfile.id,
      location: deviceProfile.location.name
    }
    
    return [newNotification, ...lastNotifications.slice(0, behavior.maxNotifications - 1)]
  }

  /**
   * Generate slider value
   */
  generateSliderValue(config, behavior, lastValue) {
    const { min = 0, max = 100 } = config
    const variation = behavior.variation
    
    let newValue = lastValue + (Math.random() - 0.5) * (max - min) * variation
    newValue = Math.max(min, Math.min(max, newValue))
    
    return Math.round(newValue)
  }

  /**
   * Generate map data
   */
  generateMapData(behavior, lastDevices, deviceProfile) {
    return lastDevices.map(device => ({
      ...device,
      lat: device.lat + (Math.random() - 0.5) * behavior.locationVariation,
      lng: device.lng + (Math.random() - 0.5) * behavior.locationVariation,
      status: Math.random() > behavior.statusChangeProbability ? device.status : 
              (Math.random() > 0.5 ? 'warning' : 'offline'),
      data: {
        ...device.data,
        temperature: device.data.temperature ? 20 + Math.random() * 10 : undefined,
        humidity: device.data.humidity ? 60 + Math.random() * 20 : undefined,
        power: device.data.power ? 80 + Math.random() * 20 : undefined,
        recording: device.data.recording !== undefined ? Math.random() > 0.3 : undefined,
        motion: device.data.motion !== undefined ? Math.random() > 0.7 : undefined
      },
      lastUpdate: new Date().toISOString()
    }))
  }

  /**
   * Generate 3D model data
   */
  generateModel3DData(behavior, lastData) {
    return {
      ...lastData,
      rotation: {
        x: lastData.rotation.x,
        y: lastData.rotation.y + (lastData.isRotating ? behavior.rotationSpeed : 0),
        z: lastData.rotation.z
      },
      scale: lastData.scale + (Math.random() - 0.5) * behavior.scaleVariation,
      isRotating: lastData.isRotating || Math.random() < behavior.autoRotateProbability
    }
  }

  /**
   * Get initial value for widget
   */
  getInitialValue(widgetType, config, deviceProfile) {
    // Provide default values if deviceProfile is missing or incomplete
    const defaultRange = { min: 0, max: 100 }
    const defaultBehavior = { 
      realisticRange: defaultRange, 
      preferredState: false 
    }
    const defaultProfile = {
      model: 'Unknown Device',
      manufacturer: 'Unknown',
      behavior: defaultBehavior
    }
    
    const safeProfile = deviceProfile || defaultProfile
    const safeBehavior = safeProfile.behavior || defaultBehavior
    const safeRange = safeBehavior.realisticRange || defaultRange

    switch (widgetType) {
      case 'gauge':
      case 'sensor':
      case 'slider':
        return Math.floor(Math.random() * (safeRange.max - safeRange.min + 1)) + safeRange.min

      case 'chart':
        return Array.from({ length: 8 }, () => Math.floor(Math.random() * 100))

      case 'toggle':
        return safeBehavior.preferredState

      case 'notification':
        return [{
          id: '1',
          type: 'info',
          title: 'System Online',
          message: `Device ${safeProfile.model} connected successfully`,
          timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          read: false,
          deviceId: safeProfile.id || 'unknown',
          location: safeProfile.location?.name || 'Unknown Location'
        }]

      case 'map':
        const deviceCount = safeBehavior.deviceCount || 3
        return Array.from({ length: deviceCount }, (_, i) => ({
          id: `device-${i + 1}`,
          name: `${safeProfile.manufacturer} ${safeProfile.model} ${i + 1}`,
          type: ['sensor', 'camera', 'actuator'][i % 3],
          status: 'online',
          lat: (safeProfile.location?.lat || 37.7749) + (Math.random() - 0.5) * 0.01,
          lng: (safeProfile.location?.lng || -122.4194) + (Math.random() - 0.5) * 0.01,
          data: {
            temperature: 20 + Math.random() * 10,
            humidity: 60 + Math.random() * 20,
            power: 80 + Math.random() * 20
          }
        }))

      case 'model3d':
        return {
          rotation: { x: 0, y: 0, z: 0 },
          scale: 1,
          isRotating: false
        }

      default:
        return 0
    }
  }

  /**
   * Enable/disable auto-generation
   */
  setEnabled(enabled) {
    this.isEnabled = enabled
    if (!enabled) {
      this.intervals.forEach(interval => clearInterval(interval))
      this.intervals.clear()
    } else {
      this.subscribers.forEach((_, widgetId) => {
        this.startValueGeneration(widgetId)
      })
    }
  }

  /**
   * Get all active subscriptions
   */
  getSubscriptions() {
    return Array.from(this.subscribers.values()).map(sub => ({
      widgetId: sub.widgetId,
      widgetType: sub.widgetType,
      panelId: sub.panelId,
      isActive: this.intervals.has(sub.widgetId),
      deviceProfile: sub.deviceProfile
    }))
  }

  /**
   * Stop all value generation
   */
  stopAll() {
    this.intervals.forEach(interval => clearInterval(interval))
    this.intervals.clear()
    this.subscribers.clear()
    this.deviceProfiles.clear()
  }
}

// Create singleton instance
const autoValueService = new AutoValueService()

export default autoValueService
