# Professional Auto-Generation System

## Overview

The IoT Dashboard now features a comprehensive, professional auto-generation system that provides realistic IoT device data simulation. This system is designed to work seamlessly until you connect to MQTT for real-time data, providing a professional demo experience.

## 🚀 Key Features

### **Realistic Device Simulation**
- **Device Profiles**: Each widget gets a unique device profile with manufacturer, model, and location
- **Realistic Behavior**: Different update intervals and variation patterns based on device type
- **Health Simulation**: Devices can show different health states affecting their behavior
- **Location Context**: Devices are assigned realistic locations (Factory Floor, Warehouse, etc.)

### **Professional Data Generation**
- **Unit-Aware Values**: Different variation patterns for temperature, pressure, voltage, etc.
- **Trending Behavior**: Occasional trending patterns for realistic sensor behavior
- **Device Health Effects**: Unhealthy devices show more erratic behavior
- **Contextual Notifications**: Realistic IoT alerts and system messages

### **Smart Update Intervals**
- **Gauge/Sensor**: 2-5 seconds (realistic sensor frequency)
- **Chart**: 3-5 seconds (smooth data visualization)
- **Toggle**: 8-20 seconds (realistic device state changes)
- **Notifications**: 15-45 seconds (realistic alert frequency)
- **Map**: 10-20 seconds (device location updates)
- **3D Model**: 100ms (smooth animation)

## 🏗️ Architecture

### **Core Components**

1. **AutoValueService** (`src/services/autoValueService.js`)
   - Centralized service managing all auto-generation
   - Device profile management
   - Realistic value generation algorithms
   - Panel context awareness

2. **useAutoValue Hook** (`src/hooks/useAutoValue.js`)
   - React hook for easy widget integration
   - Automatic subscription management
   - Device information access
   - Connection status tracking

## 📊 Widget-Specific Features

### **1. Gauge Widget**
```javascript
// Realistic numeric values with unit-aware variations
- Temperature: Small variations (±2°C)
- Pressure: Very small variations (±1hPa)
- Percentage: Moderate variations (±5%)
- Voltage/Current: Precise variations (±0.1V/A)
```

### **2. Chart Widget**
```javascript
// Smooth data shifting with realistic patterns
- 8 data points maintained
- Smooth transitions between values
- Realistic sensor data patterns
```

### **3. Toggle Widget**
```javascript
// Smart state changes with realistic timing
- 30% chance to change state
- Respects device preferences
- Realistic device behavior patterns
```

### **4. Notification Widget**
```javascript
// Contextual IoT notifications
- Device-specific alerts
- System maintenance messages
- Threshold warnings
- Connection status updates
```

### **5. Sensor Widget**
```javascript
// Advanced sensor simulation
- Trend tracking (up/down/stable)
- Unit-aware value generation
- Health-based behavior variation
- Realistic sensor drift
```

### **6. Slider Widget**
```javascript
// Interactive value control
- Respects user input during dragging
- Smooth auto-updates when not in use
- Realistic control behavior
```

### **7. Map Widget**
```javascript
// Dynamic device location simulation
- Device position variations
- Status changes (online/warning/offline)
- Realistic sensor data per device
- Location-based device clustering
```

### **8. 3D Model Widget**
```javascript
// Smooth 3D animation
- Auto-rotation with realistic speeds
- Scale variations
- Smooth animation transitions
- Interactive controls
```

## 🔧 Usage

### **Basic Widget Integration**

```jsx
import { useAutoValue } from '../../hooks/useAutoValue'

export const MyWidget = ({ widgetId, panelId, autoGenerate = true }) => {
  const { value, connected, deviceInfo } = useAutoValue(
    widgetId, 
    'gauge', 
    { min: 0, max: 100, unit: '%' }, 
    panelId, 
    autoGenerate
  )

  return (
    <div>
      <div>Value: {value}</div>
      <div>Status: {connected ? 'Live' : 'Offline'}</div>
      <div>Device: {deviceInfo?.manufacturer} {deviceInfo?.model}</div>
    </div>
  )
}
```

### **Advanced Configuration**

```jsx
// Temperature sensor with realistic behavior
const { value, connected, deviceInfo } = useAutoValue(
  'temp-sensor-1', 
  'sensor', 
  { 
    min: 20, 
    max: 30, 
    unit: '°C' 
  }, 
  'factory-panel-1', 
  true
)

// Chart with custom configuration
const { value: chartData, connected } = useAutoValue(
  'chart-1', 
  'chart', 
  { 
    chartType: 'bar',
    dataPoints: 8 
  }, 
  'warehouse-panel-2', 
  true
)
```

## 🏭 Device Profiles

### **Manufacturers**
- Siemens, ABB, Schneider Electric
- Honeywell, Emerson, Rockwell Automation
- Mitsubishi Electric, Omron, Bosch
- General Electric, Philips, Samsung, LG

### **Device Models**
Each widget type has specific model numbers:
- **Gauges**: SG-2000, MG-Pro, AG-500, TG-1000
- **Sensors**: SS-1000, TS-Pro, PS-300, HS-800
- **Charts**: CH-3000, DC-Pro, AC-200, TC-1500
- **Toggles**: TS-100, ST-Pro, AT-500, TT-200

### **Locations**
- Factory Floor A, Warehouse B, Office Building C
- Data Center D, Research Lab E

## 📈 Realistic Value Ranges

### **Temperature Sensors**
- Range: -10°C to 50°C
- Normal: 18°C to 28°C
- Variation: ±2°C

### **Pressure Sensors**
- Range: 950-1050 hPa
- Normal: 1000-1020 hPa
- Variation: ±1 hPa

### **Voltage/Current**
- Voltage: 0-24V (normal: 12-14V)
- Current: 0-10A (normal: 1-5A)
- Variation: ±0.1V/A

### **Percentage Values**
- Range: 0-100%
- Normal: 20-80%
- Variation: ±5%

## 🎛️ Control Features

### **Enable/Disable Auto-Generation**
```javascript
import autoValueService from '../services/autoValueService'

// Disable all auto-generation
autoValueService.setEnabled(false)

// Re-enable auto-generation
autoValueService.setEnabled(true)
```

### **Get Active Subscriptions**
```javascript
const subscriptions = autoValueService.getSubscriptions()
console.log('Active devices:', subscriptions)
```

### **Stop All Generation**
```javascript
autoValueService.stopAll()
```

## 🔄 MQTT Integration Ready

The auto-generation system is designed to seamlessly transition to MQTT:

1. **Same Data Structure**: Auto-generated data matches MQTT message format
2. **Easy Replacement**: Simply disable auto-generation when MQTT connects
3. **Consistent Interface**: Widgets use the same hook regardless of data source
4. **Fallback Support**: Auto-generation can serve as fallback during MQTT disconnections

## 🚀 Performance Optimized

- **Efficient Intervals**: Different update frequencies based on widget type
- **Memory Management**: Automatic cleanup of subscriptions
- **Singleton Pattern**: Single service instance across all widgets
- **Minimal CPU Usage**: Optimized algorithms for realistic data generation

## 🧪 Testing

The system includes comprehensive testing capabilities:

```javascript
// Test all widget types
const testWidgets = () => {
  // Gauge test
  autoValueService.subscribe('test-gauge', 'gauge', { min: 0, max: 100, unit: '%' }, 'test-panel', (value) => {
    console.log('Gauge value:', value)
  })
  
  // Chart test
  autoValueService.subscribe('test-chart', 'chart', { chartType: 'bar' }, 'test-panel', (value) => {
    console.log('Chart data:', value)
  })
  
  // Continue for all widget types...
}
```

## 📋 Migration from Static to Auto-Generation

1. **Add Hook Import**: `import { useAutoValue } from '../../hooks/useAutoValue'`
2. **Replace State**: Replace `useState` with `useAutoValue`
3. **Add Props**: Add `panelId` and `autoGenerate` props
4. **Update Footer**: Show device information in widget footer
5. **Test**: Verify realistic data generation

## 🎯 Benefits

- **Professional Demo**: Realistic IoT device simulation
- **Development Ready**: Perfect for development and testing
- **MQTT Compatible**: Easy transition to real-time data
- **Performance Optimized**: Minimal resource usage
- **Extensible**: Easy to add new widget types
- **Maintainable**: Centralized service architecture

This auto-generation system provides a professional, realistic IoT dashboard experience that will impress users and provide valuable development data until MQTT integration is complete.
