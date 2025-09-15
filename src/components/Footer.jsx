import { useNavigate } from 'react-router-dom'
import { 
  Cpu,
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
  Grid3X3,
  Smartphone,
  BarChart3,
  Globe,
  Wifi,
  Shield,
  Code
} from 'lucide-react'

const Footer = () => {
  const navigate = useNavigate()

  // Handle footer link clicks with scroll to top
  const handleFooterLinkClick = (path) => {
    navigate(path)
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <Cpu className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">IoT Dashboard</span>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              The ultimate IoT dashboard platform that combines the best features 
              from leading solutions to give you the most comprehensive and 
              user-friendly experience.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Platform</h3>
            <ul className="space-y-3">
              <li>
                <button 
                  onClick={() => handleFooterLinkClick('/home')}
                  className="text-gray-400 hover:text-white transition-colors flex items-center"
                >
                  <Smartphone className="w-4 h-4 mr-2" />
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
            <h3 className="text-lg font-semibold mb-6">Developers</h3>
            <ul className="space-y-3">
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
            <h3 className="text-lg font-semibold mb-6">Support</h3>
            <ul className="space-y-3">
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
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 IoT Dashboard. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
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
  )
}

export default Footer
