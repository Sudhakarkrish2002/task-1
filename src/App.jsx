import { useState, Suspense, lazy, useEffect, startTransition } from 'react'
import { Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom'
import { 
  User,
  Home,
  Grid3X3,
  LogOut,
  MessageCircle,
  Menu,
  X
} from 'lucide-react'
import ErrorBoundary from './components/ErrorBoundary'
import LoadingSpinner from './components/LoadingSpinner'
import ChatBot from './components/ChatBot'
import { useNavigation } from './hooks/useNavigation'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ToastProvider, useToast } from './contexts/ToastContext'
import mqttService from './services/mqttService'

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'))
const MyPanels = lazy(() => import('./pages/MyPanels'))
const CreatePanel = lazy(() => import('./pages/CreatePanel'))
const SignIn = lazy(() => import('./pages/SignIn'))
const SignUp = lazy(() => import('./pages/SignUp'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const SharedDashboardView = lazy(() => import('./components/SharedDashboardView'))

// Feature pages
const Features = lazy(() => import('./pages/Features'))
const Contact = lazy(() => import('./pages/Contact'))

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

function AppContent() {
  const navigate = useNavigate()
  const location = useLocation()
  const { handleNavigation } = useNavigation()
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth()
  const { showSuccess } = useToast()
  const [mqttStatus, setMqttStatus] = useState('disconnected')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)


  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserMenuOpen && !event.target.closest('.user-menu')) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isUserMenuOpen])

  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    })
  }, [location.pathname])

  // Initialize MQTT connection
  useEffect(() => {
    if (isAuthenticated && user) {
      // Try to connect to MQTT broker
      mqttService.connect().then(() => {
        setMqttStatus('connected')
        console.log('✅ MQTT connected successfully')
      }).catch((error) => {
        console.log('⚠️ MQTT broker not available, using simulation:', error.message)
        mqttService.simulateConnection()
        setMqttStatus('simulated')
      })
    } else {
      setMqttStatus('disconnected')
      mqttService.disconnect()
    }
  }, [isAuthenticated, user])

  // Handle logout
  const handleLogout = () => {
    logout()
    setMqttStatus('disconnected')
    mqttService.disconnect()
    showSuccess('Logged out successfully')
  }


  // Navigation items
  const navItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/home' },
    { id: 'features', label: 'Features', icon: Grid3X3, path: '/features' },
    { id: 'panels', label: 'My Panels', icon: Grid3X3, path: '/panels' },
    { id: 'contact', label: 'Contact', icon: MessageCircle, path: '/contact' },
  ]

  // Show loading while checking authentication
  if (authLoading) {
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

  // If user is not authenticated and not on auth pages or shared dashboard, redirect to signin
  if (!isAuthenticated && 
      location.pathname !== '/signin' && 
      location.pathname !== '/signup' && 
      location.pathname !== '/forgot-password' && 
      location.pathname !== '/reset-password' && 
      !location.pathname.startsWith('/shared/')) {
    return <SignIn />
  }

  // If user is authenticated and on auth pages, redirect to home
  if (isAuthenticated && (
      location.pathname === '/signin' || 
      location.pathname === '/signup' || 
      location.pathname === '/forgot-password' || 
      location.pathname === '/reset-password')) {
    startTransition(() => {
      navigate('/home', { replace: true })
    })
    return null
  }


  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Global Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-xl font-bold text-gray-900">IoT Dashboard</span>
              </div>
              
              {/* Desktop Navigation Links */}
              <div className="hidden lg:block ml-10">
                <div className="flex items-center space-x-1">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = location.pathname === item.path
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavigation(item.path)}
                        className={`group flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          isActive 
                            ? 'bg-red-50 text-red-600 shadow-sm' 
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className={`w-4 h-4 transition-colors ${
                          isActive ? 'text-red-600' : 'text-gray-500 group-hover:text-gray-700'
                        }`} />
                        <span>{item.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Right side items */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              
              {/* User Menu */}
              <div className="relative user-menu">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="group flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium">{user?.name || 'User'}</span>
                </button>
                
                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{user?.name || 'User'}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-3 text-gray-500" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 bg-white">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.path
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        handleNavigation(item.path)
                        setIsMobileMenuOpen(false)
                      }}
                      className={`group flex items-center space-x-3 w-full px-3 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                        isActive 
                          ? 'bg-red-50 text-red-600' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className={`w-5 h-5 transition-colors ${
                        isActive ? 'text-red-600' : 'text-gray-500 group-hover:text-gray-700'
                      }`} />
                      <span>{item.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="main-content flex-1">
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner fullScreen text="Loading page..." />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/features" element={<Features />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/panels" element={<MyPanels />} />
            <Route path="/create" element={<CreatePanel />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/shared/:panelId" element={<SharedDashboardRoute />} />
          </Routes>
          </Suspense>
        </ErrorBoundary>
      </div>

      {/* Global ChatBot */}
      <ChatBot />
    </div>
  )
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  )
}

export default App