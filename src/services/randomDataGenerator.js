// Random Data Generator for IoT Dashboard
// Generates realistic sensor data using JavaScript random number generator

class RandomDataGenerator {
  constructor() {
    this.devices = [
      { id: 'temp-sensor-01', name: 'Temperature Sensor 1', type: 'temperature', unit: '°C', min: -10, max: 50 },
      { id: 'humidity-sensor-01', name: 'Humidity Sensor 1', type: 'humidity', unit: '%', min: 0, max: 100 },
      { id: 'pressure-sensor-01', name: 'Pressure Sensor 1', type: 'pressure', unit: 'hPa', min: 950, max: 1050 },
      { id: 'light-sensor-01', name: 'Light Sensor 1', type: 'light', unit: 'lux', min: 0, max: 1000 },
      { id: 'motion-sensor-01', name: 'Motion Sensor 1', type: 'motion', unit: 'detected', min: 0, max: 1 },
      { id: 'co2-sensor-01', name: 'CO2 Sensor 1', type: 'co2', unit: 'ppm', min: 300, max: 2000 },
      { id: 'voltage-sensor-01', name: 'Voltage Sensor 1', type: 'voltage', unit: 'V', min: 0, max: 24 },
      { id: 'current-sensor-01', name: 'Current Sensor 1', type: 'current', unit: 'A', min: 0, max: 10 }
    ]
    
    this.lastValues = {}
    this.initializeLastValues()
  }

  initializeLastValues() {
    this.devices.forEach(device => {
      this.lastValues[device.id] = this.generateInitialValue(device)
    })
  }

  generateInitialValue(device) {
    switch (device.type) {
      case 'temperature':
        return 20 + Math.random() * 10 // 20-30°C
      case 'humidity':
        return 40 + Math.random() * 30 // 40-70%
      case 'pressure':
        return 1000 + Math.random() * 20 // 1000-1020 hPa
      case 'light':
        return Math.random() * 500 // 0-500 lux
      case 'motion':
        return Math.random() > 0.8 ? 1 : 0 // 20% chance of motion
      case 'co2':
        return 400 + Math.random() * 200 // 400-600 ppm
      case 'voltage':
        return 12 + Math.random() * 4 // 12-16V
      case 'current':
        return Math.random() * 5 // 0-5A
      default:
        return device.min + Math.random() * (device.max - device.min)
    }
  }

  // Generate realistic sensor data with some correlation to previous values
  generateSensorData(deviceId) {
    const device = this.devices.find(d => d.id === deviceId)
    if (!device) return null

    const lastValue = this.lastValues[deviceId] || this.generateInitialValue(device)
    let newValue

    switch (device.type) {
      case 'temperature':
        // Temperature changes slowly, ±2°C max change
        newValue = lastValue + (Math.random() - 0.5) * 4
        newValue = Math.max(device.min, Math.min(device.max, newValue))
        break
      
      case 'humidity':
        // Humidity changes moderately, ±5% max change
        newValue = lastValue + (Math.random() - 0.5) * 10
        newValue = Math.max(device.min, Math.min(device.max, newValue))
        break
      
      case 'pressure':
        // Pressure changes slowly, ±1 hPa max change
        newValue = lastValue + (Math.random() - 0.5) * 2
        newValue = Math.max(device.min, Math.min(device.max, newValue))
        break
      
      case 'light':
        // Light can change dramatically
        newValue = Math.random() * device.max
        break
      
      case 'motion':
        // Motion is binary, with some persistence
        newValue = Math.random() > 0.7 ? (lastValue === 1 ? 0 : 1) : lastValue
        break
      
      case 'co2':
        // CO2 increases slowly, decreases with ventilation
        newValue = lastValue + (Math.random() - 0.3) * 20
        newValue = Math.max(device.min, Math.min(device.max, newValue))
        break
      
      case 'voltage':
        // Voltage is relatively stable
        newValue = lastValue + (Math.random() - 0.5) * 0.5
        newValue = Math.max(device.min, Math.min(device.max, newValue))
        break
      
      case 'current':
        // Current can vary more
        newValue = lastValue + (Math.random() - 0.5) * 2
        newValue = Math.max(device.min, Math.min(device.max, newValue))
        break
      
      default:
        newValue = device.min + Math.random() * (device.max - device.min)
    }

    this.lastValues[deviceId] = newValue

    // Add some console logging for debugging
    console.log(`📊 ${device.name}: ${Math.round(newValue * 100) / 100}${device.unit} (${this.getDeviceStatus(device.type, newValue)})`)

    return {
      deviceId: device.id,
      deviceName: device.name,
      type: device.type,
      value: Math.round(newValue * 100) / 100, // Round to 2 decimal places
      unit: device.unit,
      timestamp: new Date().toISOString(),
      status: this.getDeviceStatus(device.type, newValue)
    }
  }

  getDeviceStatus(type, value) {
    switch (type) {
      case 'temperature':
        if (value < 0) return 'critical'
        if (value > 40) return 'warning'
        return 'normal'
      
      case 'humidity':
        if (value < 20 || value > 80) return 'warning'
        return 'normal'
      
      case 'pressure':
        if (value < 980 || value > 1030) return 'warning'
        return 'normal'
      
      case 'co2':
        if (value > 1000) return 'warning'
        if (value > 1500) return 'critical'
        return 'normal'
      
      case 'voltage':
        if (value < 10 || value > 20) return 'warning'
        return 'normal'
      
      case 'current':
        if (value > 8) return 'warning'
        return 'normal'
      
      default:
        return 'normal'
    }
  }

  // Generate data for all devices
  generateAllSensorData() {
    return this.devices.map(device => this.generateSensorData(device.id))
  }

  // Generate data for specific device types
  generateDataByType(type) {
    const devicesOfType = this.devices.filter(device => device.type === type)
    return devicesOfType.map(device => this.generateSensorData(device.id))
  }

  // Get device information
  getDevices() {
    return this.devices
  }

  // Get device by ID
  getDevice(deviceId) {
    return this.devices.find(device => device.id === deviceId)
  }

  // Generate historical data for charts
  generateHistoricalData(deviceId, hours = 24, intervalMinutes = 5) {
    const device = this.getDevice(deviceId)
    if (!device) return []

    const data = []
    const now = new Date()
    const points = (hours * 60) / intervalMinutes

    for (let i = points; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - (i * intervalMinutes * 60 * 1000))
      const value = this.generateSensorData(deviceId)
      data.push({
        timestamp: timestamp.toISOString(),
        value: value.value,
        unit: value.unit
      })
    }

    return data
  }

  // Generate random alerts/notifications
  generateAlert() {
    const alertTypes = [
      { type: 'temperature_high', message: 'Temperature sensor reading above normal range', severity: 'warning' },
      { type: 'humidity_low', message: 'Humidity levels below recommended range', severity: 'info' },
      { type: 'motion_detected', message: 'Motion detected in monitored area', severity: 'info' },
      { type: 'device_offline', message: 'Device connection lost', severity: 'error' },
      { type: 'co2_high', message: 'CO2 levels above safe threshold', severity: 'warning' },
      { type: 'voltage_low', message: 'Low voltage detected on power supply', severity: 'warning' }
    ]

    const randomAlert = alertTypes[Math.floor(Math.random() * alertTypes.length)]
    const device = this.devices[Math.floor(Math.random() * this.devices.length)]

    return {
      id: Date.now().toString(),
      type: randomAlert.type,
      message: randomAlert.message,
      severity: randomAlert.severity,
      deviceId: device.id,
      deviceName: device.name,
      timestamp: new Date().toISOString(),
      acknowledged: false
    }
  }
}

// Create singleton instance
const randomDataGenerator = new RandomDataGenerator()

export default randomDataGenerator
