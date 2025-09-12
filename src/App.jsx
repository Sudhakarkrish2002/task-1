import { useState, Suspense, lazy, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom'
import { 
  Bell, 
  Settings,
  User,
  Home,
  Grid3X3,
  LogOut
} from 'lucide-react'
import ErrorBoundary from './components/ErrorBoundary'
import LoadingSpinner from './components/LoadingSpinner'

// Lazy load pages for better performance
const MyPanels = lazy(() => import('./pages/MyPanels'))
const CreatePanel = lazy(() => import('./pages/CreatePanel'))
const DashboardContainer = lazy(() => import('./pages/DashboardContainer'))
const SignIn = lazy(() => import('./pages/SignIn'))
const SharedDashboardView = lazy(() => import('./components/SharedDashboardView'))

// Shared Dashboard Route Component
function SharedDashboardRoute() {
  const { panelId } = useParams()
  return (
    <SharedDashboardView 
      panelId={panelId} 
      onAccessGranted={(data) => console.log('Access granted:', data)}
    />
  )
}

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(null)
  const [mqttStatus, setMqttStatus] = useState('disconnected')

  // Check authentication on app load
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        console.log('User authenticated:', userData.email)
      } catch (error) {
        console.error('Error parsing user data:', error)
        localStorage.removeItem('user')
      }
    }
  }, [])

  // Initialize MQTT connection (disabled for now - using random data only)
  useEffect(() => {
    if (user) {
      // For now, just set status as connected for UI display
      setMqttStatus('connected')
      
      // TODO: Enable MQTT connection in future
      // mqttService.connect().catch(() => {
      //   console.log('Real MQTT broker not available, using simulation')
      //   mqttService.simulateConnection()
      // })
    }
  }, [user])

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
    setMqttStatus('disconnected')
    // mqttService.disconnect() // TODO: Enable when MQTT is active
    navigate('/signin')
  }

  // Navigation items
  const navItems = [
    { id: 'panels', label: 'My Panels', icon: Home, path: '/' },
  ]

  // If user is not authenticated and not on signin page or shared dashboard, redirect to signin
  if (!user && location.pathname !== '/signin' && !location.pathname.startsWith('/shared/')) {
    return <SignIn />
  }

  // If user is authenticated and on signin page, redirect to home
  if (user && location.pathname === '/signin') {
    navigate('/')
    return null
  }

  // Show loading while checking authentication
  if (user === null && location.pathname !== '/signin' && !location.pathname.startsWith('/shared/')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Global Navigation */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <span className="text-xl font-bold text-gray-900">IoT Dashboard</span>
            </div>
            
            <nav className="flex items-center space-x-6">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.path)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-red-100 text-red-600' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* MQTT Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                mqttStatus === 'connected' ? 'bg-green-500' : 
                mqttStatus === 'reconnecting' ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <span className="text-sm text-gray-600">MQTT {mqttStatus}</span>
            </div>
            
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded">
              <Settings className="w-5 h-5" />
            </button>
            
            {/* User Menu */}
            <div className="relative group">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center cursor-pointer">
                <User className="w-4 h-4 text-gray-600" />
              </div>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-3 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <div className="p-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner fullScreen text="Loading page..." />}>
          <Routes>
            <Route path="/" element={<MyPanels />} />
            <Route path="/create" element={<CreatePanel />} />
            <Route path="/dashboard-container" element={<DashboardContainer />} />
            <Route path="/dashboard" element={<DashboardContainer />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/shared/:panelId" element={<SharedDashboardRoute />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>

    </div>
  )
}

export default App