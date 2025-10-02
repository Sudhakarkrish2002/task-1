import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNavigation } from '../hooks/useNavigation'
import CreateDashboardModal from '../components/CreateDashboardModal'
import { usePanelStore } from '../stores/usePanelStore'
import { 
  BarChart3, 
  Globe, 
  Cpu, 
  Smartphone, 
  Shield, 
  Zap,
  CheckCircle,
  ArrowRight,
  Play,
  Download,
  Eye,
  Settings,
  Database,
  Cloud,
  Lock,
  Users,
  TrendingUp,
  Activity,
  Bell,
  Map,
  Code,
  Layers,
  Palette,
  Monitor,
  Server,
  Wifi,
  Key,
  Award,
  FileText,
  RefreshCw,
  Maximize2,
  Filter,
  Search,
  Mail,
  Phone,
  MapPin,
  Github,
  Twitter,
  Linkedin,
  Facebook,
  Youtube,
  HelpCircle,
  BookOpen,
  MessageCircle,
  Grid3X3
} from 'lucide-react'

function Features() {
  const navigate = useNavigate()
  const { handleFooterLinkClick } = useNavigation()
  const [activeCategory, setActiveCategory] = useState('analytics')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const featureCategories = [
    {
      id: 'analytics',
      title: 'Real-Time Analytics',
      icon: BarChart3,
      color: 'blue',
      description: 'Advanced data visualization and analytics platform'
    },
    {
      id: 'connectivity',
      title: 'Global Connectivity',
      icon: Globe,
      color: 'indigo',
      description: 'Multi-protocol connectivity worldwide'
    },
    {
      id: 'hardware',
      title: 'Hardware Agnostic',
      icon: Cpu,
      color: 'red',
      description: 'Universal hardware compatibility'
    },
    {
      id: 'mobile',
      title: 'No-Code Mobile Apps',
      icon: Smartphone,
      color: 'green',
      description: 'Build native mobile apps without coding'
    },
    {
      id: 'security',
      title: 'Enterprise Security',
      icon: Shield,
      color: 'purple',
      description: 'Industrial-grade security and compliance'
    }
  ]

  const analyticsFeatures = [
    {
      icon: Activity,
      title: "Real-Time Data Streaming",
      description: "Process and visualize data as it arrives from your devices with sub-second latency",
      capabilities: [
        "Sub-100ms data processing",
        "Live data visualization",
        "Real-time alerts and notifications",
        "Streaming analytics engine"
      ]
    },
    {
      icon: BarChart3,
      title: "Advanced Visualizations",
      description: "Create stunning charts, graphs, and dashboards with our comprehensive visualization library",
      capabilities: [
        "Interactive charts and graphs",
        "Custom dashboard layouts",
        "3D visualizations",
        "Geographic data mapping"
      ]
    },
    {
      icon: TrendingUp,
      title: "Predictive Analytics",
      description: "Leverage machine learning to predict trends, anomalies, and future outcomes",
      capabilities: [
        "Anomaly detection",
        "Trend forecasting",
        "Predictive maintenance",
        "Machine learning models"
      ]
    },
    {
      icon: Database,
      title: "Data Management",
      description: "Store, process, and analyze massive amounts of IoT data with enterprise-grade infrastructure",
      capabilities: [
        "Time-series databases",
        "Data compression and archiving",
        "Query optimization",
        "Data export and APIs"
      ]
    }
  ]

  const connectivityFeatures = [
    {
      icon: Wifi,
      title: "Multi-Protocol Support",
      description: "Connect devices using WiFi, Cellular, LoRaWAN, and more",
      capabilities: [
        "WiFi 6/6E support",
        "5G/LTE cellular",
        "LoRaWAN networks",
        "Bluetooth connectivity"
      ]
    },
    {
      icon: Globe,
      title: "Global Coverage",
      description: "Deploy devices anywhere in the world with our global network",
      capabilities: [
        "200+ countries coverage",
        "Local data centers",
        "Edge computing nodes",
        "Satellite connectivity"
      ]
    },
    {
      icon: Cloud,
      title: "Edge Computing",
      description: "Process data locally for reduced latency and improved performance",
      capabilities: [
        "Local data processing",
        "Reduced bandwidth usage",
        "Offline functionality",
        "Real-time analytics"
      ]
    },
    {
      icon: Zap,
      title: "Failover Systems",
      description: "Automatic failover ensures continuous connectivity",
      capabilities: [
        "Automatic switching",
        "Multiple backup paths",
        "Health monitoring",
        "Seamless recovery"
      ]
    }
  ]

  const hardwareFeatures = [
    {
      icon: Cpu,
      title: "Universal Compatibility",
      description: "Support for all major IoT hardware platforms and microcontrollers",
      capabilities: [
        "Arduino ecosystem",
        "ESP32/ESP8266 support",
        "Raspberry Pi integration",
        "Industrial controllers"
      ]
    },
    {
      icon: Code,
      title: "SDK & Libraries",
      description: "Comprehensive software development kits for all platforms",
      capabilities: [
        "C/C++ SDKs",
        "Python libraries",
        "JavaScript SDKs",
        "Arduino libraries"
      ]
    },
    {
      icon: Zap,
      title: "Rapid Prototyping",
      description: "Quick development and testing with pre-built examples",
      capabilities: [
        "Code examples",
        "Tutorial projects",
        "Sample applications",
        "Quick start guides"
      ]
    },
    {
      icon: Shield,
      title: "Industrial Grade",
      description: "Enterprise-ready hardware support with reliability guarantees",
      capabilities: [
        "Industrial certifications",
        "Extended temperature range",
        "Vibration resistance",
        "EMC compliance"
      ]
    }
  ]

  const mobileFeatures = [
    {
      icon: Layers,
      title: "Drag & Drop Builder",
      description: "Build beautiful mobile apps without writing a single line of code",
      capabilities: [
        "Visual app builder interface",
        "Pre-built UI components",
        "Real-time preview",
        "Responsive design system"
      ]
    },
    {
      icon: Zap,
      title: "Instant Deployment",
      description: "Deploy your apps to iOS and Android app stores in minutes",
      capabilities: [
        "One-click deployment",
        "Automatic app store submission",
        "Over-the-air updates",
        "Version management"
      ]
    },
    {
      icon: Palette,
      title: "Custom Branding",
      description: "Customize your app with your brand colors, logos, and themes",
      capabilities: [
        "Custom color schemes",
        "Logo and icon customization",
        "Branded splash screens",
        "White-label solutions"
      ]
    },
    {
      icon: Database,
      title: "Real-Time Data Sync",
      description: "Keep your mobile app data synchronized with your IoT devices",
      capabilities: [
        "Live data streaming",
        "Offline data caching",
        "Conflict resolution",
        "Data synchronization"
      ]
    }
  ]

  const securityFeatures = [
    {
      icon: Lock,
      title: "End-to-End Encryption",
      description: "Military-grade encryption protects your data in transit and at rest",
      capabilities: [
        "AES-256 encryption",
        "TLS 1.3 protocols",
        "Perfect forward secrecy",
        "Zero-knowledge architecture"
      ]
    },
    {
      icon: Shield,
      title: "Zero Trust Security",
      description: "Never trust, always verify - comprehensive security model",
      capabilities: [
        "Identity verification",
        "Device authentication",
        "Network segmentation",
        "Continuous monitoring"
      ]
    },
    {
      icon: Key,
      title: "Advanced Key Management",
      description: "Secure key generation, rotation, and management",
      capabilities: [
        "Hardware security modules",
        "Automatic key rotation",
        "Multi-factor authentication",
        "Certificate management"
      ]
    },
    {
      icon: Monitor,
      title: "24/7 Security Monitoring",
      description: "Continuous threat detection and response",
      capabilities: [
        "Real-time threat detection",
        "Automated incident response",
        "Security analytics",
        "Compliance reporting"
      ]
    }
  ]

  const getFeaturesByCategory = (category) => {
    switch (category) {
      case 'analytics': return analyticsFeatures
      case 'connectivity': return connectivityFeatures
      case 'hardware': return hardwareFeatures
      case 'mobile': return mobileFeatures
      case 'security': return securityFeatures
      default: return analyticsFeatures
    }
  }

  const getColorClasses = (color) => {
    // Always return red theme regardless of input color
    return {
      bg: 'bg-red-100',
      text: 'text-red-600',
      border: 'border-red-600',
      gradient: 'from-red-500 to-red-600',
      hover: 'hover:bg-red-700'
    }
  }

  const currentFeatures = getFeaturesByCategory(activeCategory)
  const currentCategory = featureCategories.find(cat => cat.id === activeCategory)
  const colors = getColorClasses(currentCategory.color)

  // Create Panel functionality
  const handleCreatePanel = () => {
    setShowCreateModal(true)
  }

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


  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Comprehensive IoT Platform Features
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to build, deploy, and manage IoT solutions at scale. 
              From real-time analytics to enterprise security, we've got you covered.
            </p>
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-4 py-6">
            {featureCategories.map((category) => {
              const Icon = category.icon
              const isActive = activeCategory === category.id
              const categoryColors = getColorClasses(category.color)
              
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex flex-col items-center space-y-2 px-6 py-3 rounded-lg transition-all ${
                    isActive
                      ? `${categoryColors.bg} ${categoryColors.text} ${categoryColors.border} border-2`
                      : 'text-gray-600 hover:text-red-600 hover:bg-red-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <div className="text-center">
                    <div className="font-semibold">{category.title}</div>
                    <div className="text-sm opacity-75">{category.description}</div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Features Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Category Header */}
        <div className="text-center mb-12">
          <div className={`w-16 h-16 ${colors.bg} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
            <currentCategory.icon className={`w-8 h-8 ${colors.text}`} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {currentCategory.title}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {currentCategory.description}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {currentFeatures.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div key={index} className="bg-white rounded-xl p-8 border border-gray-200 hover:shadow-lg transition-shadow text-center">
                <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center mb-6 mx-auto`}>
                  <Icon className={`w-6 h-6 ${colors.text}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">{feature.title}</h3>
                <p className="text-gray-600 mb-6 text-center">{feature.description}</p>
                <ul className="space-y-3 text-center">
                  {feature.capabilities.map((capability, idx) => (
                    <li key={idx} className="flex items-center justify-center text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-3 flex-shrink-0" />
                      {capability}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        {/* Demo Section */}
        <div className="bg-white rounded-xl p-8 border border-gray-200 mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold text-gray-900">Live Demo</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Live Data</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className={`bg-gradient-to-br ${colors.gradient} rounded-lg p-6 text-white`}>
              <div className="flex items-center justify-between mb-4">
                <Activity className="w-8 h-8" />
                <span className="text-white/80 text-sm">Temperature</span>
              </div>
              <div className="text-3xl font-bold">24.5°C</div>
              <div className="text-white/80 text-sm">+2.1° from yesterday</div>
            </div>
            <div className={`bg-gradient-to-br ${colors.gradient} rounded-lg p-6 text-white`}>
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8" />
                <span className="text-white/80 text-sm">Humidity</span>
              </div>
              <div className="text-3xl font-bold">65%</div>
              <div className="text-white/80 text-sm">Optimal range</div>
            </div>
            <div className={`bg-gradient-to-br ${colors.gradient} rounded-lg p-6 text-white`}>
              <div className="flex items-center justify-between mb-4">
                <Zap className="w-8 h-8" />
                <span className="text-white/80 text-sm">Power Usage</span>
              </div>
              <div className="text-3xl font-bold">1.2kW</div>
              <div className="text-white/80 text-sm">-15% efficiency</div>
            </div>
            <div className={`bg-gradient-to-br ${colors.gradient} rounded-lg p-6 text-white`}>
              <div className="flex items-center justify-between mb-4">
                <Database className="w-8 h-8" />
                <span className="text-white/80 text-sm">Data Rate</span>
              </div>
              <div className="text-3xl font-bold">2.4K/s</div>
              <div className="text-white/80 text-sm">Peak performance</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center">
          <button 
            onClick={handleCreatePanel}
            className="flex items-center px-8 py-4 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            <ArrowRight className="w-5 h-5 mr-2" />
            Start Building
          </button>
        </div>
      </div>

      {/* All Features Overview */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Complete IoT Solution Platform
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our comprehensive platform provides everything you need to build, deploy, and scale IoT solutions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featureCategories.map((category) => {
              const Icon = category.icon
              const categoryColors = getColorClasses(category.color)
              
              return (
                <div key={category.id} className="text-center p-6">
                  <div className={`w-16 h-16 ${categoryColors.bg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <Icon className={`w-8 h-8 ${categoryColors.text}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">{category.title}</h3>
                  <p className="text-gray-600 text-sm text-center">{category.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Build Your IoT Solution?
          </h2>
          <p className="text-xl mb-8 text-gray-300">
            Join thousands of developers and enterprises building the future with our comprehensive IoT platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleCreatePanel}
              className="flex items-center px-8 py-4 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              <Zap className="w-5 h-5 mr-2" />
              Start Building Now
            </button>
            <button 
              onClick={() => navigate('/')}
              className="flex items-center px-8 py-4 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-red-600 transition-colors"
            >
              <Eye className="w-5 h-5 mr-2" />
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 content-max-width">
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
                <button className="text-gray-400 hover:text-white transition-colors">
                  <Github className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button className="text-gray-400 hover:text-white transition-colors">
                  <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button className="text-gray-400 hover:text-white transition-colors">
                  <Linkedin className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button className="text-gray-400 hover:text-white transition-colors">
                  <Facebook className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button className="text-gray-400 hover:text-white transition-colors">
                  <Youtube className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
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
                  <button className="text-gray-400 hover:text-white transition-colors flex items-center">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Documentation
                  </button>
                </li>
                <li>
                  <button className="text-gray-400 hover:text-white transition-colors flex items-center">
                    <Code className="w-4 h-4 mr-2" />
                    API Reference
                  </button>
                </li>
                <li>
                  <button className="text-gray-400 hover:text-white transition-colors flex items-center">
                    <Cpu className="w-4 h-4 mr-2" />
                    Hardware Support
                  </button>
                </li>
                <li>
                  <button className="text-gray-400 hover:text-white transition-colors flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Community
                  </button>
                </li>
                <li>
                  <button className="text-gray-400 hover:text-white transition-colors flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Tutorials
                  </button>
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
                <button className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </button>
                <button className="text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </button>
                <button className="text-gray-400 hover:text-white transition-colors">
                  Cookie Policy
                </button>
                <button className="text-gray-400 hover:text-white transition-colors">
                  GDPR
                </button>
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

export default Features
