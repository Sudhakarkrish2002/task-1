# IoT Dashboard

A modern, responsive IoT control panel dashboard built with Vite, React, and JavaScript.

## Features

### Core Features
- **My Panels**: Dashboard management interface showing all user-created panels
- **Create New Panel**: Drag-and-drop widget builder for IoT dashboards
- **Panel Sharing**: Share dashboards with other users (view-only or edit permissions)
- **Real-Time Sync**: Live data updates from IoT devices via WebSocket

### Widget Types
- **Toggle Buttons**: UI switches for device control
- **Sliders**: Material UI sliders for value adjustment
- **Gauges**: Apache ECharts gauge charts for sensor data
- **Graphs**: ECharts visualizations (line, bar, area, pie)
- **Maps**: Leaflet.js maps for device location
- **3D Models**: Three.js 3D device models
- **Sensor Data Tiles**: ECharts mini-tiles for sensor readings
- **Notifications Widget**: WebSocket push notifications

## Tech Stack

### Frontend
- **Framework**: React with Vite
- **Language**: JavaScript
- **UI**: TailwindCSS components
- **Visualization**: Apache ECharts, Three.js, Leaflet.js
- **Drag & Drop**: React-Grid-Layout
- **State Management**: Zustand
- **Real-time**: WebSocket client
- **Routing**: React Router

### Key Dependencies
- `vite`: ^4.4.0
- `react`: ^18.2.0
- `react-router-dom`: ^6.8.0
- `zustand`: ^4.4.0
- `echarts`: ^5.4.0
- `three`: ^0.158.0
- `leaflet`: ^1.9.0
- `react-grid-layout`: ^1.4.0

## Project Structure

```
iot-dashboard/
├── public/
│   ├── icons/
│   │   ├── device-icons/
│   │   └── widget-icons/
│   └── favicon.ico
├── src/
│   ├── pages/                         # React Router Pages
│   │   ├── HomePage.jsx               # Landing page
│   │   ├── DashboardPage.jsx          # My Panels page
│   │   ├── CreatePanelPage.jsx        # Create New Panel
│   │   ├── ViewPanelPage.jsx          # View Panel
│   │   └── EditPanelPage.jsx          # Edit Panel
│   ├── components/
│   │   ├── ui/                        # Base UI Components
│   │   ├── layout/                    # Layout Components
│   │   ├── panels/                    # Panel Management
│   │   └── widgets/                   # Dashboard Widgets
│   ├── hooks/                         # Custom React Hooks
│   ├── stores/                        # Zustand State Management
│   ├── lib/                           # Utility Libraries
│   └── types/                         # JavaScript Definitions
├── index.html
├── vite.config.js
├── package.json
└── tailwind.config.js
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd iot-dashboard
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Data Flow

### Real-Time Updates
```
Device → MQTT Broker → Backend → WebSocket → Frontend → ECharts/Three.js updates
```

### Example Flow (Temperature Sensor)
1. User adds Gauge widget → selects topic `home/livingroom/temp`
2. Device publishes: `home/livingroom/temp = 28`
3. MQTT → Backend → WebSocket → Panel updates ECharts gauge instantly

## Widget Configuration

Each widget can be configured with:
- **Position**: x, y coordinates and size (w, h)
- **Styling**: colors, borders, opacity
- **Data Source**: MQTT topic and device connection
- **Behavior**: refresh intervals, display options

## State Management

The application uses Zustand for state management with separate stores for:
- **Panel Store**: Panel CRUD operations and current panel state
- **Widget Store**: Widget selection and configuration
- **Device Store**: Device connections and real-time data
- **Auth Store**: User authentication and permissions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
