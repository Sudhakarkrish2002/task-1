import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNavigation } from '../hooks/useNavigation'
import { 
  Play, 
  BarChart3, 
  Smartphone, 
  Zap, 
  Shield, 
  Globe, 
  Cpu, 
  ArrowRight,
  Star,
  Download,
  Code,
  Eye,
  Wifi,
  Layers,
  Mail,
  Phone,
  MapPin,
  Github,
  Twitter,
  Linkedin,
  Facebook,
  Youtube,
  HelpCircle,
  FileText,
  Users,
  Settings,
  BookOpen,
  MessageCircle,
  Grid3X3
} from 'lucide-react'
import CreateDashboardModal from '../components/CreateDashboardModal'
import { usePanelStore } from '../stores/usePanelStore'

function HomePage() {
  const navigate = useNavigate()
  const { handleFooterLinkClick } = useNavigation()
  const [stats, setStats] = useState({
    devicesConnected: 0,
    dataPointsProcessed: 0,
    activeUsers: 0,
    uptime: '99.9%'
  })
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Handle create dashboard functionality
  const handleCreateDashboard = async (dashboardData) => {
    try {
      const newPanel = usePanelStore.getState().createPanel(dashboardData)
      alert('Dashboard created successfully!')
      // Navigate to the create panel page with the new panel for editing
      navigate(`/create?edit=${newPanel.id}`)
    } catch (error) {
      console.error('Error creating dashboard:', error)
      throw error
    }
  }


  // Static stats - will be replaced with real-time data
  useEffect(() => {
    setStats({
      devicesConnected: 0,
      dataPointsProcessed: 0,
      activeUsers: 0,
      uptime: '99.9%'
    })
  }, [])


  const features = [
    {
      icon: BarChart3,
      title: "Real-Time Analytics",
      description: "Advanced data visualization with MATLAB integration and custom analytics",
      color: "text-red-600",
      bgColor: "bg-red-100"
    },
    {
      icon: Smartphone,
      title: "No-Code Mobile Apps",
      description: "Build beautiful mobile apps with drag-and-drop interface, no coding required",
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      icon: Zap,
      title: "Instant Device Control",
      description: "Real-time remote control and monitoring of your IoT devices",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Industrial-grade security with encrypted communications and 24/7 monitoring",
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      icon: Globe,
      title: "Global Connectivity",
      description: "Support for WiFi, Cellular, LoRaWAN, and Satellite connections worldwide",
      color: "text-indigo-600",
      bgColor: "bg-indigo-100"
    },
    {
      icon: Cpu,
      title: "Hardware Agnostic",
      description: "Compatible with Arduino, ESP32, Raspberry Pi, and industrial controllers",
      color: "text-red-600",
      bgColor: "bg-red-100"
    }
  ]


  const quickStartSteps = [
    {
      step: 1,
      title: "Connect Your Device",
      description: "Use our simple WiFi provisioning to connect any IoT device",
      icon: Wifi
    },
    {
      step: 2,
      title: "Create Your Dashboard",
      description: "Drag and drop widgets to build your custom dashboard",
      icon: Layers
    },
    {
      step: 3,
      title: "Deploy & Monitor",
      description: "Launch your dashboard and start monitoring in real-time",
      icon: Eye
    }
  ]

  return (
    <div className="page-content w-full overflow-x-hidden">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-12 sm:pb-16 lg:pb-20">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 leading-tight hero-title text-responsive-xl">
                Low-Code IoT Cloud Platform with User Experience at its Core
              </h1>
              <p className="text-lg sm:text-xl mb-6 sm:mb-8 text-red-100 leading-relaxed hero-subtitle text-responsive-md">
                Easily build exceptional, fully customizable mobile and web IoT applications. 
                Securely deploy and manage millions of devices worldwide with enterprise-grade 
                security and real-time analytics.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-red-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors button-responsive"
                >
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Start Building Free
                </button>
                <button className="flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-red-600 transition-colors button-responsive">
                  <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Watch Demo
                </button>
              </div>
            </div>
            <div className="relative mt-8 lg:mt-0">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/20">
                <div className="grid grid-cols-2 gap-4 sm:gap-6">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-white">{stats.devicesConnected.toLocaleString()}</div>
                    <div className="text-red-200 text-xs sm:text-sm">Devices Connected</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-white">{(stats.dataPointsProcessed / 1000).toFixed(1)}M</div>
                    <div className="text-red-200 text-xs sm:text-sm">Data Points/Hour</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-white">{stats.activeUsers.toLocaleString()}</div>
                    <div className="text-red-200 text-xs sm:text-sm">Active Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-white">{stats.uptime}</div>
                    <div className="text-red-200 text-xs sm:text-sm">Uptime</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* IoT Complexity Solved Section */}
      <div className="py-12 sm:py-16 lg:py-20 bg-white section-padding">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 content-max-width">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 text-responsive-lg">
              IoT Complexity Solved at Every Stage
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-4xl mx-auto text-responsive-md">
              Manage the full IoT lifecycle from prototype to production with enterprise security throughout. 
              Build high-quality mobile apps and cloud services, run fleet tests, deploy seamlessly, 
              market to users, manage devices, data, configurations and updates, and analyze and grow your IoT business.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 grid-cols-responsive">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Smartphone className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 flex-shrink-0" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 text-center">Mobile Apps</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Build high-quality apps at no-code speed. Our apps make it easy to configure and deeply 
                customize beautiful, feature-rich applications without a line of code.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 text-center">Web Console</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Efficiently support and grow your IoT business. Our console makes it easy to manage 
                every aspect of your connected business, from operations to overall growth.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 flex-shrink-0" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4 text-center">User Experience</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Seamless and intuitive user experience, out-of-box. Our UX simplifies IoT complexity 
                into easy workflows for product managers, engineers, and device users.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 sm:py-16 lg:py-20 bg-white section-padding">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 content-max-width">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 text-responsive-lg">
              Why Choose Our Platform?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto text-responsive-md">
              We've combined the best features from leading IoT platforms to give you 
              the most comprehensive and user-friendly solution available.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="bg-white rounded-xl p-6 sm:p-8 hover:shadow-lg transition-shadow border border-gray-100">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>


      {/* Quick Start Section */}
      <div className="py-12 sm:py-16 lg:py-20 bg-white section-padding">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 content-max-width">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 text-responsive-lg">
              Get Started in Minutes
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 text-responsive-md">
              From device connection to dashboard deployment in just 3 simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 grid-cols-responsive">
            {quickStartSteps.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={index} className="text-center">
                  <div className="mb-4 sm:mb-6">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
                    </div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-sm sm:text-base text-gray-600">{step.description}</p>
                </div>
              )
            })}
          </div>
          
          <div className="text-center mt-8 sm:mt-12">
            <button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors mx-auto button-responsive"
            >
              Start Your First Dashboard
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
            </button>
          </div>
        </div>
      </div>

      {/* Industry Recognition & Stats */}
      <div className="py-12 sm:py-16 lg:py-20 bg-white section-padding">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 content-max-width">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 text-responsive-lg">
              Trusted by Developers and Businesses Worldwide
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 text-responsive-md">
              We have designed, developed, and tested the building blocks of a complete IoT software solution, 
              so businesses that run on our platform don't have to.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-12 sm:mb-16">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-red-600 mb-2">1M+</div>
              <div className="text-sm sm:text-base text-gray-600">Engineers Worldwide</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-red-600 mb-2">5,000+</div>
              <div className="text-sm sm:text-base text-gray-600">Companies Building</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-red-600 mb-2">180B+</div>
              <div className="text-sm sm:text-base text-gray-600">Hardware Requests/Month</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-red-600 mb-2">136</div>
              <div className="text-sm sm:text-base text-gray-600">Countries</div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                  Join Our Community
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-6">
                  Join our community of developers, makers, and IoT professionals. 
                  Over 1,000,000 engineers in 136 countries use our platform.
                </p>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                      <Smartphone className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
                    </div>
                    <span className="text-sm sm:text-base text-gray-700">No-code mobile apps with drag-and-drop simplicity</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                      <Globe className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                    </div>
                    <span className="text-sm sm:text-base text-gray-700">Cloud web app for data visualization and device management</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                      <Code className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                    </div>
                    <span className="text-sm sm:text-base text-gray-700">HTTPS and MQTT API for seamless integration</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                      <Cpu className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600" />
                    </div>
                    <span className="text-sm sm:text-base text-gray-700">Support for Arduino, ESP32, Raspberry Pi, and more</span>
                  </div>
                </div>
              </div>
              <div className="text-center mt-6 md:mt-0">
                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 sm:p-8 text-white">
                  <h4 className="text-lg sm:text-xl font-semibold mb-4">Ready to Start Building?</h4>
                  <p className="mb-6 text-red-100 text-sm sm:text-base">
                    Whether you're a small team with big IoT dreams or a large enterprise 
                    looking to fast track your IoT product launch, we have you covered.
                  </p>
                  <button 
                    onClick={() => setShowCreateModal(true)}
                    className="w-full bg-white text-red-600 px-4 sm:px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Start Building Today
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-12 sm:py-16 lg:py-20 bg-gray-50 section-padding">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 content-max-width">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 text-responsive-lg">
              Trusted by Developers Worldwide
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 text-responsive-md">
              Join thousands of developers building the future of IoT
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 grid-cols-responsive">
            <div className="bg-white rounded-xl p-6 sm:p-8 border border-gray-200">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                "This platform allowed us to take an idea and make it a real product offering quickly and efficiently. 
                From prototype to production in just 6 months."
              </p>
              <div className="flex items-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-full mr-3 flex-shrink-0"></div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm sm:text-base">Peachie Hytowitz</div>
                  <div className="text-xs sm:text-sm text-gray-500">Senior Product Manager at Raypak</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 sm:p-8 border border-gray-200">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                "Our users have been very impressed with the ease of connecting devices to WiFi, 
                as well as navigating the app's different features. Native mobile apps in days."
              </p>
              <div className="flex items-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-full mr-3 flex-shrink-0"></div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm sm:text-base">Daniel Mayer</div>
                  <div className="text-xs sm:text-sm text-gray-500">Co-Founder, Co-CEO of Windmill</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 sm:p-8 border border-gray-200">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                "The platform enabled rapid development and deployment without the need for an external software team. 
                Perfect for our sustainable future initiatives."
              </p>
              <div className="flex items-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-full mr-3 flex-shrink-0"></div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm sm:text-base">Andres Torres</div>
                  <div className="text-xs sm:text-sm text-gray-500">CTO at Plantaform Inc.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-12 sm:py-16 lg:py-20 bg-red-600 text-white section-padding">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center content-max-width">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6 text-responsive-lg">
            Enough Scrolling. Start Building Today!
          </h2>
          <p className="text-lg sm:text-xl mb-6 sm:mb-8 text-red-100 text-responsive-md">
            Whether you're a small team with big IoT dreams or a large enterprise looking to 
            fast track your IoT product launch, our platform has you covered.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-red-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors button-responsive"
            >
              <Code className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Start Building Now
            </button>
            <button 
              onClick={() => navigate('/panels')}
              className="flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-red-600 transition-colors button-responsive"
            >
              <Eye className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              View Examples
            </button>
          </div>
          
          <div className="mt-8 sm:mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-bold mb-2">6 months</div>
              <div className="text-red-200 text-sm sm:text-base">From idea to product</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold mb-2">70+ years</div>
              <div className="text-red-200 text-sm sm:text-base">Industry experience</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold mb-2">Award winning</div>
              <div className="text-red-200 text-sm sm:text-base">Startup solutions</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 content-max-width">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 grid-cols-responsive">
            {/* Company Info */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-600 rounded-lg flex items-center justify-center">
                  <Cpu className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <span className="text-xl sm:text-2xl font-bold">IoT Dashboard</span>
              </div>
              <p className="text-sm sm:text-base text-gray-400 mb-4 sm:mb-6 leading-relaxed">
                The ultimate IoT dashboard platform that combines the best features 
                from leading solutions to give you the most comprehensive and 
                user-friendly experience.
              </p>
              <div className="flex space-x-3 sm:space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Github className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Linkedin className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Facebook className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <Youtube className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
              </div>
            </div>

            {/* Platform */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">Platform</h3>
              <ul className="space-y-2 sm:space-y-3">
                <li>
                  <button 
                    onClick={() => handleFooterLinkClick('/home')}
                    className="text-sm sm:text-base text-gray-400 hover:text-white transition-colors flex items-center"
                  >
                    <Smartphone className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    Mobile Apps
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleFooterLinkClick('/features')}
                    className="text-gray-400 hover:text-white transition-colors flex items-center"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Features
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleFooterLinkClick('/panels')}
                    className="text-gray-400 hover:text-white transition-colors flex items-center"
                  >
                    <Grid3X3 className="w-4 h-4 mr-2" />
                    Web Console
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleFooterLinkClick('/features')}
                    className="text-gray-400 hover:text-white transition-colors flex items-center"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Cloud Services
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleFooterLinkClick('/features')}
                    className="text-gray-400 hover:text-white transition-colors flex items-center"
                  >
                    <Wifi className="w-4 h-4 mr-2" />
                    Connectivity
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleFooterLinkClick('/features')}
                    className="text-gray-400 hover:text-white transition-colors flex items-center"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Security
                  </button>
                </li>
              </ul>
            </div>

            {/* Developers */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">Developers</h3>
              <ul className="space-y-2 sm:space-y-3">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center">
                    <Code className="w-4 h-4 mr-2" />
                    API Reference
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center">
                    <Cpu className="w-4 h-4 mr-2" />
                    Hardware Support
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Community
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Tutorials
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">Support</h3>
              <ul className="space-y-2 sm:space-y-3">
                <li>
                  <button 
                    onClick={() => handleFooterLinkClick('/features')}
                    className="text-gray-400 hover:text-white transition-colors flex items-center"
                  >
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Help Center
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleFooterLinkClick('/contact')}
                    className="text-gray-400 hover:text-white transition-colors flex items-center"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contact Support
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleFooterLinkClick('/features')}
                    className="text-gray-400 hover:text-white transition-colors flex items-center"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    System Status
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleFooterLinkClick('/features')}
                    className="text-gray-400 hover:text-white transition-colors flex items-center"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Release Notes
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleFooterLinkClick('/contact')}
                    className="text-gray-400 hover:text-white transition-colors flex items-center"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Enterprise
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Information */}
          <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-red-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="text-white">support@iotdashboard.com</p>
                </div>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-red-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-400">Phone</p>
                  <p className="text-white">+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-red-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-400">Address</p>
                  <p className="text-white">San Francisco, CA</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-400 text-xs sm:text-sm mb-4 md:mb-0">
                © 2024 IoT Dashboard. All rights reserved.
              </div>
              <div className="flex flex-wrap justify-center md:justify-end space-x-4 sm:space-x-6 text-xs sm:text-sm">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Cookie Policy
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  GDPR
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Create Dashboard Modal */}
      <CreateDashboardModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateDashboard={handleCreateDashboard}
      />
    </div>
  )
}

export default HomePage
