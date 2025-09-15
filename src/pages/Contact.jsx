import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CreateDashboardModal from '../components/CreateDashboardModal'
import { usePanelStore } from '../stores/usePanelStore'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  MessageCircle, 
  Users, 
  Headphones, 
  Globe, 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Building,
  User,
  Calendar,
  FileText,
  Zap,
  Shield,
  Award,
  TrendingUp,
  Star,
  ChevronRight,
  Cpu,
  Github,
  Twitter,
  Linkedin,
  Facebook,
  Youtube,
  HelpCircle,
  Settings,
  BookOpen,
  Grid3X3,
  BarChart3,
  Smartphone,
  Wifi,
  Code
} from 'lucide-react'

function Contact() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    subject: '',
    message: '',
    inquiryType: 'general'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitStatus('success')
      setFormData({
        name: '',
        email: '',
        company: '',
        phone: '',
        subject: '',
        message: '',
        inquiryType: 'general'
      })
    }, 2000)
  }

  // Handle navigation to features page with scroll to top
  const handleExploreFeatures = () => {
    navigate('/features')
    // Scroll to top after navigation
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }, 100)
  }

  // Handle create panel functionality
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

  // Handle footer link clicks with scroll to top
  const handleFooterLinkClick = (path) => {
    navigate(path)
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Support",
      description: "Get help from our technical team",
      primary: "support@iotdashboard.com",
      secondary: "sales@iotdashboard.com",
      responseTime: "Within 2 hours"
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak directly with our experts",
      primary: "+1 (555) 123-4567",
      secondary: "+1 (555) 987-6543",
      responseTime: "24/7 Available"
    },
    {
      icon: MapPin,
      title: "Office Location",
      description: "Visit our headquarters",
      primary: "123 IoT Innovation Drive",
      secondary: "San Francisco, CA 94105",
      responseTime: "Mon-Fri 9AM-6PM PST"
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Instant support via chat",
      primary: "Available on website",
      secondary: "Average response: 30 seconds",
      responseTime: "24/7 Available"
    }
  ]

  const supportOptions = [
    {
      icon: Users,
      title: "Enterprise Support",
      description: "Dedicated support for enterprise customers",
      features: ["Dedicated account manager", "Priority support", "Custom SLA", "On-site training"],
      color: "blue"
    },
    {
      icon: Headphones,
      title: "Technical Support",
      description: "Expert help with technical issues",
      features: ["24/7 phone support", "Remote assistance", "Documentation", "Video tutorials"],
      color: "green"
    },
    {
      icon: Globe,
      title: "Global Support",
      description: "Worldwide support coverage",
      features: ["Multi-language support", "Regional offices", "Local partnerships", "Time zone coverage"],
      color: "purple"
    }
  ]

  const faqItems = [
    {
      question: "How quickly can I get started with your IoT platform?",
      answer: "You can get started in minutes with our free tier. Simply sign up, create your first dashboard, and connect your devices using our comprehensive SDKs and APIs."
    },
    {
      question: "Do you offer custom integrations for enterprise clients?",
      answer: "Yes, we provide custom integration services for enterprise clients. Our team works with you to integrate our platform with your existing systems and workflows."
    },
    {
      question: "What security measures do you have in place?",
      answer: "We implement enterprise-grade security including end-to-end encryption, zero-trust architecture, SOC 2 Type II compliance, and 24/7 security monitoring."
    },
    {
      question: "Can I migrate from other IoT platforms?",
      answer: "Absolutely! We provide migration tools and services to help you seamlessly transition from other IoT platforms while preserving your data and configurations."
    }
  ]

  const getColorClasses = (color) => {
    const colorMap = {
      blue: {
        bg: 'bg-blue-100',
        text: 'text-blue-600',
        border: 'border-blue-200'
      },
      green: {
        bg: 'bg-green-100',
        text: 'text-green-600',
        border: 'border-green-200'
      },
      purple: {
        bg: 'bg-purple-100',
        text: 'text-purple-600',
        border: 'border-purple-200'
      }
    }
    return colorMap[color] || colorMap.blue
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Home
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Contact Us</h1>
                <p className="text-gray-600">Get in touch with our IoT experts</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Support Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Contact Information */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Multiple Ways to Reach Us
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the communication method that works best for you. Our team is available 
              around the clock to assist with your IoT needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((info, index) => {
              const Icon = info.icon
              return (
                <div key={index} className="text-center p-6 bg-gray-50 rounded-xl hover:shadow-lg transition-shadow">
                  <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-red-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{info.title}</h4>
                  <p className="text-gray-600 text-sm mb-4">{info.description}</p>
                  <div className="space-y-2">
                    <div className="font-medium text-gray-900">{info.primary}</div>
                    <div className="text-sm text-gray-600">{info.secondary}</div>
                    <div className="text-xs text-red-600 font-medium">{info.responseTime}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Contact Form & Support Options */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Send us a Message</h3>
                <p className="text-gray-600">
                  Fill out the form below and we'll get back to you within 2 hours during business hours.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="john@company.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Your Company"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Inquiry Type
                  </label>
                  <select
                    name="inquiryType"
                    value={formData.inquiryType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="sales">Sales & Pricing</option>
                    <option value="technical">Technical Support</option>
                    <option value="enterprise">Enterprise Solutions</option>
                    <option value="partnership">Partnership</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Brief description of your inquiry"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                    placeholder="Please provide details about your inquiry..."
                  />
                </div>

                {submitStatus === 'success' && (
                  <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    <span className="text-green-800">Message sent successfully! We'll get back to you soon.</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center px-6 py-4 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Sending Message...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Support Options */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Support Options</h3>
                <div className="space-y-6">
                  {supportOptions.map((option, index) => {
                    const Icon = option.icon
                    const colors = getColorClasses(option.color)
                    return (
                      <div key={index} className={`p-6 rounded-xl border ${colors.border} ${colors.bg}`}>
                        <div className="flex items-start space-x-4">
                          <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <Icon className={`w-6 h-6 ${colors.text}`} />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">{option.title}</h4>
                            <p className="text-gray-600 mb-4">{option.description}</p>
                            <ul className="space-y-2">
                              {option.features.map((feature, idx) => (
                                <li key={idx} className="flex items-center text-sm text-gray-600">
                                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Why Choose Our Support?</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600 mb-1">99.9%</div>
                    <div className="text-sm text-gray-600">Uptime SLA</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600 mb-1">&lt; 2hr</div>
                    <div className="text-sm text-gray-600">Response Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600 mb-1">24/7</div>
                    <div className="text-sm text-gray-600">Support Available</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600 mb-1">4.9★</div>
                    <div className="text-sm text-gray-600">Customer Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h3>
            <p className="text-lg text-gray-600">
              Quick answers to common questions about our IoT platform and services.
            </p>
          </div>

          <div className="space-y-6">
            {faqItems.map((item, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">{item.question}</h4>
                <p className="text-gray-600 leading-relaxed">{item.answer}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-600 mb-4">Still have questions?</p>
            <button 
              onClick={handleExploreFeatures}
              className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors mx-auto"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Contact Support
            </button>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-red-600 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-red-100">
            Join thousands of developers and enterprises building the future with our comprehensive IoT platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleCreatePanel}
              className="flex items-center px-8 py-4 bg-white text-red-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              <Zap className="w-5 h-5 mr-2" />
              Start Free Trial
            </button>
            <button 
              onClick={handleExploreFeatures}
              className="flex items-center px-8 py-4 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-red-600 transition-colors"
            >
              <ChevronRight className="w-5 h-5 mr-2" />
              Explore Features
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

export default Contact

