# MQTT Setup Guide for IoT Dashboard

## Overview
The IoT Dashboard now includes full MQTT support for real-time data communication with IoT devices. This guide will help you set up an MQTT broker and configure the dashboard to connect to it.

## MQTT Broker Options

### Option 1: Local MQTT Broker (Recommended for Development)

#### Using Mosquitto (Easiest)
1. **Install Mosquitto:**
   ```bash
   # macOS
   brew install mosquitto
   
   # Ubuntu/Debian
   sudo apt-get install mosquitto mosquitto-clients
   
   # Windows
   # Download from: https://mosquitto.org/download/
   ```

2. **Start Mosquitto:**
   ```bash
   # Start with default settings
   mosquitto -v
   
   # Or start as a service
   sudo systemctl start mosquitto
   ```

3. **Default Configuration:**
   - Host: `localhost`
   - Port: `1883` (WebSocket: `9001`)
   - No authentication required

### Option 2: Cloud MQTT Brokers

#### Eclipse Mosquitto (Free)
- URL: `test.mosquitto.org`
- Port: `1883` (WebSocket: `8080`)
- No authentication required

#### HiveMQ (Free Tier)
- URL: `broker.hivemq.com`
- Port: `1883` (WebSocket: `8000`)
- No authentication required

#### AWS IoT Core
- Requires AWS account and setup
- More complex but production-ready

## Dashboard Configuration

### Environment Variables
Create a `.env` file in the project root:

```env
# MQTT Configuration
VITE_MQTT_HOST=localhost
VITE_MQTT_PORT=1883
VITE_MQTT_PROTOCOL=ws
VITE_MQTT_USERNAME=
VITE_MQTT_PASSWORD=

# For WebSocket connection (recommended for web apps)
VITE_MQTT_PROTOCOL=ws
VITE_MQTT_PORT=9001

# For cloud brokers
VITE_MQTT_HOST=test.mosquitto.org
VITE_MQTT_PORT=8080
```

### Default Configuration
If no environment variables are set, the dashboard will use:
- Host: `localhost`
- Port: `1883`
- Protocol: `ws` (WebSocket)
- No authentication

## Testing MQTT Connection

### 1. Start the Dashboard
```bash
npm run dev
```

### 2. Test with MQTT Client
Install an MQTT client to test:

```bash
# Install MQTT client
npm install -g mqtt

# Subscribe to test topic
mqtt sub -h localhost -t "sensors/temperature"

# Publish test data
mqtt pub -h localhost -t "sensors/temperature" -m '{"value": 25.5, "timestamp": "2024-01-01T12:00:00Z"}'
```

### 3. Test Topics
The dashboard supports these MQTT topics:

- `sensors/temperature` - Temperature sensor data
- `sensors/humidity` - Humidity sensor data
- `sensors/pressure` - Pressure sensor data
- `devices/status` - Device status updates
- `notifications/alerts` - System notifications

## Widget Configuration

### Adding MQTT Topics to Widgets

1. **In Create Panel:**
   - Add widgets to your dashboard
   - Each widget can be configured with an MQTT topic
   - The topic determines where the widget gets its data from

2. **Example Widget Configuration:**
   ```javascript
   {
     type: 'gauge',
     title: 'Temperature',
     mqttTopic: 'sensors/temperature',
     min: 0,
     max: 100,
     unit: '°C'
   }
   ```

### Data Format
MQTT messages should be in JSON format:

```json
{
  "value": 25.5,
  "timestamp": "2024-01-01T12:00:00Z",
  "unit": "°C"
}
```

## Troubleshooting

### Connection Issues
1. **Check MQTT Broker Status:**
   ```bash
   # Test connection
   mqtt pub -h localhost -t "test" -m "hello"
   ```

2. **Check Browser Console:**
   - Open Developer Tools (F12)
   - Look for MQTT connection messages
   - Check for WebSocket connection errors

3. **Common Issues:**
   - **WebSocket connection failed:** Make sure broker supports WebSocket
   - **CORS errors:** Use a broker that supports CORS or run locally
   - **Authentication failed:** Check username/password in .env file

### Fallback Mode
If MQTT connection fails, the dashboard will automatically:
- Show "Simulated" status
- Generate random data for demonstration
- Allow full functionality without real MQTT data

## Production Deployment

### Security Considerations
1. **Use Authentication:**
   ```env
   VITE_MQTT_USERNAME=your_username
   VITE_MQTT_PASSWORD=your_password
   ```

2. **Use TLS/SSL:**
   ```env
   VITE_MQTT_PROTOCOL=wss
   VITE_MQTT_PORT=8883
   ```

3. **Network Security:**
   - Use VPN or private networks
   - Implement proper firewall rules
   - Use certificate-based authentication

### Scaling
- Use clustered MQTT brokers for high availability
- Implement message persistence
- Monitor broker performance
- Use load balancers for multiple broker instances

## Example IoT Device Integration

### Arduino/ESP32 Example
```cpp
#include <WiFi.h>
#include <PubSubClient.h>

const char* ssid = "your_wifi";
const char* password = "your_password";
const char* mqtt_server = "your_broker_ip";

WiFiClient espClient;
PubSubClient client(espClient);

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  
  client.setServer(mqtt_server, 1883);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  
  // Publish sensor data
  float temperature = 25.5; // Read from sensor
  String payload = "{\"value\":" + String(temperature) + ",\"timestamp\":\"" + String(millis()) + "\"}";
  client.publish("sensors/temperature", payload.c_str());
  
  delay(5000);
}

void reconnect() {
  while (!client.connected()) {
    if (client.connect("ESP32Client")) {
      Serial.println("Connected to MQTT broker");
    } else {
      delay(5000);
    }
  }
}
```

## Support
For issues or questions:
1. Check the browser console for error messages
2. Verify MQTT broker is running and accessible
3. Test with MQTT client tools
4. Check network connectivity and firewall settings

The dashboard is designed to work seamlessly with or without MQTT, providing a smooth development and production experience.
