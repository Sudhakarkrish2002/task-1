# MQTT Integration Guide

This guide explains how to use the MQTT functionality in the IoT Dashboard application.

## Overview

The MQTT integration provides real-time data communication between the dashboard and IoT devices. The system is built around:

- **mqttService.js**: Core MQTT service with connection management
- **App.jsx**: MQTT context provider and global connection management
- **useMQTT hook**: Easy access to MQTT functionality in components

## Key Features

### 1. Connection Management
- Automatic connection when user is authenticated
- Connection retry logic with exponential backoff
- Connection status monitoring
- Graceful disconnection on logout

### 2. Topic Subscription
- Panel-specific subscriptions (using panel ID as topic)
- Global system topic subscriptions
- Wildcard topic support
- Automatic subscription cleanup

### 3. Message Handling
- JSON message parsing
- Custom event dispatching for widget updates
- Error handling for malformed messages
- Message routing to appropriate handlers

## Usage Examples

### Basic Component Integration

```jsx
import React, { useEffect } from 'react'
import { useMQTT } from '../hooks/useMQTT'

const MyComponent = ({ panelId }) => {
  const {
    mqttService,
    mqttStatus,
    subscribeToPanel,
    unsubscribeFromPanel,
    publishToPanel
  } = useMQTT()

  useEffect(() => {
    if (mqttService.isConnected && panelId) {
      // Subscribe to panel data
      const handler = (data, topic) => {
        console.log('Received data:', data)
        // Handle the data
      }

      subscribeToPanel(panelId, handler)

      // Cleanup on unmount
      return () => {
        unsubscribeFromPanel(panelId, handler)
      }
    }
  }, [panelId, mqttService.isConnected])

  const sendData = () => {
    const data = { value: 42, timestamp: new Date().toISOString() }
    publishToPanel(panelId, 'my-widget', data)
  }

  return (
    <div>
      <p>MQTT Status: {mqttStatus}</p>
      <button onClick={sendData}>Send Data</button>
    </div>
  )
}
```

### Widget Update Handling

```jsx
import React, { useEffect, useState } from 'react'

const MyWidget = ({ panelId, widgetId }) => {
  const [data, setData] = useState(null)

  useEffect(() => {
    const handleWidgetUpdate = (event) => {
      const { panelId: eventPanelId, widgetId: eventWidgetId, data: eventData } = event.detail
      
      if (eventPanelId === panelId && eventWidgetId === widgetId) {
        setData(eventData)
      }
    }

    window.addEventListener('mqtt-widget-update', handleWidgetUpdate)
    
    return () => {
      window.removeEventListener('mqtt-widget-update', handleWidgetUpdate)
    }
  }, [panelId, widgetId])

  return (
    <div>
      {data ? (
        <div>Value: {data.value}</div>
      ) : (
        <div>No data received</div>
      )}
    </div>
  )
}
```

## MQTT Service API

### Connection Methods

```javascript
// Connect to MQTT broker
await mqttService.connect()

// Disconnect from broker
mqttService.disconnect()

// Get connection status
const status = mqttService.getConnectionStatus()
```

### Subscription Methods

```javascript
// Subscribe to a topic
mqttService.subscribe(topic, handler)

// Subscribe to panel (using panel ID as topic)
mqttService.subscribeToPanel(panelId, handler)

// Unsubscribe from topic
mqttService.unsubscribe(topic, handler)

// Unsubscribe from panel
mqttService.unsubscribeFromPanel(panelId, handler)
```

### Publishing Methods

```javascript
// Publish to topic
mqttService.publish(topic, message, options)

// Publish to panel
mqttService.publishToPanel(panelId, widgetId, data)
```

## Data Format

### Panel Data Format
```json
{
  "widget_id_1": {
    "value": 42,
    "timestamp": "2024-01-01T12:00:00.000Z",
    "type": "sensor"
  },
  "widget_id_2": {
    "value": true,
    "timestamp": "2024-01-01T12:00:00.000Z",
    "type": "toggle"
  }
}
```

### Message Handlers
```javascript
const handler = (data, topic) => {
  // data: parsed JSON object or plain text
  // topic: the topic that received the message
  console.log('Received:', data, 'on topic:', topic)
}
```

## Global Topics

The system automatically subscribes to these global topics:

- `system/status`: System status updates
- `system/notifications`: System notifications
- `system/alerts`: System alerts

## Error Handling

The MQTT service includes comprehensive error handling:

- Connection timeout handling
- Reconnection attempts with backoff
- Message parsing error recovery
- Subscription error handling

## Best Practices

1. **Always check connection status** before subscribing or publishing
2. **Clean up subscriptions** in component unmount
3. **Use panel-specific subscriptions** for widget data
4. **Handle connection failures gracefully**
5. **Use the useMQTT hook** for easy integration

## Configuration

MQTT connection settings are configured in `mqttService.js`:

```javascript
const defaultOptions = {
  host: 'your-mqtt-broker.com',
  port: 8884,
  protocol: 'wss',
  username: 'your-username',
  password: 'your-password',
  clientId: `iot-dashboard-${Math.random().toString(16).substr(2, 8)}`,
  clean: true,
  reconnectPeriod: 1000,
  connectTimeout: 5000
}
```

## Testing

Use the `MQTTExample` component to test MQTT functionality:

```jsx
import MQTTExample from '../components/MQTTExample'

// In your component
<MQTTExample panelId="test-panel" />
```

This component provides:
- Connection status display
- Test data publishing
- Message history
- Subscription management

## Troubleshooting

### Common Issues

1. **Connection fails**: Check broker URL, credentials, and network connectivity
2. **No messages received**: Verify topic subscriptions and message format
3. **Memory leaks**: Ensure proper cleanup of subscriptions and event listeners
4. **Reconnection issues**: Check the connection retry logic and max attempts

### Debug Information

Enable debug logging by checking the browser console for MQTT-related messages:
- 🔄 Connection attempts
- ✅ Successful connections
- ❌ Connection errors
- 📨 Message receipts
- 📤 Message publications
