import { useState, useRef, useEffect } from 'react'
import { 
  MessageCircle, 
  Send, 
  X, 
  Minimize2, 
  Bot, 
  User,
  ChevronDown,
  ChevronUp,
  Zap,
  BarChart3,
  Smartphone,
  Shield,
  Globe,
  Cpu,
  HelpCircle,
  Clock,
  CheckCircle
} from 'lucide-react'

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Enhanced default questions with more variety
  const defaultQuestions = [
    {
      id: 1,
      text: "How do I get started with creating my first IoT dashboard?",
      category: "Getting Started"
    },
    {
      id: 2,
      text: "What hardware devices are supported? (Arduino, ESP32, Raspberry Pi)",
      category: "Hardware"
    },
    {
      id: 3,
      text: "How secure is the platform and data transmission?",
      category: "Security"
    },
    {
      id: 4,
      text: "Can I build mobile apps without coding experience?",
      category: "Mobile Apps"
    },
    {
      id: 5,
      text: "What analytics and data visualization features are available?",
      category: "Analytics"
    },
    {
      id: 6,
      text: "What are the pricing plans and what's included?",
      category: "Pricing"
    },
    {
      id: 7,
      text: "How do I connect my Arduino or ESP32 device?",
      category: "Hardware"
    },
    {
      id: 8,
      text: "Is there a free trial or free tier available?",
      category: "Pricing"
    },
    {
      id: 9,
      text: "What kind of support do you provide?",
      category: "Support"
    },
    {
      id: 10,
      text: "Can I integrate with existing systems and APIs?",
      category: "Analytics"
    }
  ]

  // Comprehensive Q&A Database
  const qaDatabase = {
    // Getting Started
    gettingStarted: {
      patterns: ['start', 'getting started', 'first dashboard', 'begin', 'setup', 'onboard', 'tutorial', 'guide'],
      response: {
        text: "🚀 Welcome to IoT Dashboard! Here's how to get started:\n\n**Step 1: Create Account**\n• Click 'Start Building Free' to sign up\n• No credit card required for free tier\n• Get instant access to the platform\n\n**Step 2: Build Your First Dashboard**\n• Use our drag-and-drop interface\n• Choose from 50+ pre-built widgets\n• Customize layouts and themes\n\n**Step 3: Connect Devices**\n• Use WiFi provisioning for easy setup\n• Support for Arduino, ESP32, Raspberry Pi\n• Real-time device monitoring\n\n**Step 4: Deploy & Monitor**\n• Launch your dashboard instantly\n• Monitor data in real-time\n• Share with team members\n\nNeed help with any specific step?",
        quickActions: ["Device connection guide", "Dashboard templates", "Video tutorials", "Contact support"]
      }
    },

    // Hardware Support
    hardware: {
      patterns: ['hardware', 'device', 'arduino', 'esp32', 'raspberry pi', 'microcontroller', 'sensor', 'compatible', 'support'],
      response: {
        text: "🔧 **Supported Hardware Platforms:**\n\n**Microcontrollers:**\n• Arduino (Uno, Nano, Mega, Leonardo)\n• ESP32/ESP8266 (WiFi + Bluetooth)\n• STM32 series\n• Particle devices\n\n**Single Board Computers:**\n• Raspberry Pi (all models)\n• BeagleBone Black\n• Orange Pi\n• NVIDIA Jetson\n\n**Industrial & Professional:**\n• PLCs (Siemens, Allen-Bradley)\n• Industrial gateways\n• Custom embedded systems\n\n**Connectivity Options:**\n• WiFi (802.11 b/g/n/ac)\n• Cellular (2G/3G/4G/5G)\n• LoRaWAN\n• Ethernet\n• Bluetooth\n\n**SDK & APIs:**\n• REST API for custom integrations\n• MQTT protocol support\n• WebSocket for real-time data\n• Custom SDKs for major platforms\n\nNeed help with a specific device?",
        quickActions: ["Arduino setup guide", "ESP32 tutorial", "Raspberry Pi guide", "Custom integration help"]
      }
    },

    // Security
    security: {
      patterns: ['security', 'encrypt', 'safe', 'secure', 'privacy', 'data protection', 'compliance', 'gdpr'],
      response: {
        text: "🔒 **Enterprise-Grade Security:**\n\n**Data Protection:**\n• AES-256 encryption in transit and at rest\n• TLS 1.3 for all communications\n• Zero-knowledge architecture\n• End-to-end encryption\n\n**Access Control:**\n• Multi-factor authentication (MFA)\n• Role-based access control (RBAC)\n• Single Sign-On (SSO) integration\n• API key management\n\n**Compliance & Certifications:**\n• SOC 2 Type II certified\n• GDPR compliant\n• ISO 27001 certified\n• HIPAA ready\n\n**Monitoring & Auditing:**\n• 24/7 security monitoring\n• Real-time threat detection\n• Comprehensive audit logs\n• Automated security updates\n\n**Infrastructure:**\n• AWS/Azure cloud hosting\n• 99.9% uptime SLA\n• Global CDN with DDoS protection\n• Regular security assessments\n\nYour data is our top priority!",
        quickActions: ["Security whitepaper", "Compliance documentation", "Privacy policy", "Security audit report"]
      }
    },

    // Mobile Apps
    mobile: {
      patterns: ['mobile', 'app', 'no-code', 'ios', 'android', 'smartphone', 'native app', 'app store'],
      response: {
        text: "📱 **No-Code Mobile App Builder:**\n\n**What You Can Build:**\n• Native iOS and Android apps\n• Cross-platform compatibility\n• Custom branding and themes\n• Offline functionality\n\n**Features Included:**\n• Drag-and-drop interface builder\n• Real-time data synchronization\n• Push notifications\n• User authentication\n• Custom navigation\n\n**Deployment:**\n• Direct deployment to App Store/Google Play\n• Enterprise app distribution\n• Over-the-air updates\n• Version control\n\n**Development Time:**\n• Basic app: 30 minutes\n• Advanced app: 2-4 hours\n• No coding required\n• Professional results\n\n**Pricing:**\n• Free tier: 1 app, basic features\n• Pro: $19/month - unlimited apps\n• Enterprise: Custom pricing\n\nReady to build your first app?",
        quickActions: ["App builder demo", "Mobile app examples", "Deployment guide", "App store submission"]
      }
    },

    // Analytics & Visualization
    analytics: {
      patterns: ['analytics', 'visualization', 'chart', 'data', 'dashboard', 'report', 'insights', 'metrics'],
      response: {
        text: "📊 **Advanced Analytics & Visualization:**\n\n**Chart Types:**\n• Line, bar, pie, and area charts\n• Real-time gauges and meters\n• Geographic maps and heatmaps\n• 3D visualizations\n• Custom chart widgets\n\n**Data Processing:**\n• Real-time data streaming\n• Historical data analysis\n• Predictive analytics with ML\n• Custom calculations and formulas\n• Data aggregation and filtering\n\n**Dashboard Features:**\n• Drag-and-drop layout builder\n• Responsive design for all devices\n• Custom themes and branding\n• Interactive filters and drill-downs\n• Scheduled reports and alerts\n\n**Performance:**\n• Sub-100ms data processing\n• Handle millions of data points\n• Real-time updates\n• Optimized for mobile devices\n\n**Integrations:**\n• MATLAB integration\n• Excel/CSV import/export\n• REST API for custom data\n• Webhook support\n\nCreate stunning visualizations in minutes!",
        quickActions: ["Analytics demo", "Chart gallery", "Dashboard templates", "Data integration guide"]
      }
    },

    // Pricing
    pricing: {
      patterns: ['cost', 'price', 'pricing', 'free', 'plan', 'subscription', 'billing', 'trial'],
      response: {
        text: "💰 **Flexible Pricing Plans:**\n\n**🆓 Free Tier:**\n• Up to 5 devices\n• Basic dashboard features\n• 1 mobile app\n• Community support\n• 1GB data storage\n• Perfect for testing\n\n**💼 Professional - $29/month:**\n• Up to 50 devices\n• Advanced analytics\n• Unlimited dashboards\n• 5 mobile apps\n• Email support\n• 10GB data storage\n• Custom themes\n\n**🏢 Enterprise - Custom:**\n• Unlimited devices\n• White-label solution\n• Dedicated support\n• Custom integrations\n• On-premise deployment\n• SLA guarantees\n• Advanced security\n\n**🎯 Add-ons:**\n• Additional devices: $2/device/month\n• Extra storage: $5/10GB/month\n• Premium support: $99/month\n\n**Special Offers:**\n• 14-day free trial (no credit card)\n• Student discount: 50% off\n• Non-profit discount: 30% off\n• Annual billing: 20% discount\n\nStart free today!",
        quickActions: ["Start free trial", "View detailed pricing", "Contact sales", "Calculate costs"]
      }
    },

    // Technical Support
    support: {
      patterns: ['help', 'support', 'issue', 'problem', 'bug', 'error', 'troubleshoot', 'contact'],
      response: {
        text: "🛠️ **Technical Support Options:**\n\n**Self-Service:**\n• Comprehensive documentation\n• Video tutorials and guides\n• Community forum\n• Knowledge base with 500+ articles\n• API documentation\n\n**Support Channels:**\n• Email support: support@iotdashboard.com\n• Live chat: Available 9 AM - 6 PM EST\n• Phone support: +1 (555) 123-4567\n• Video calls for complex issues\n\n**Response Times:**\n• Free tier: 48 hours\n• Professional: 24 hours\n• Enterprise: 4 hours\n• Critical issues: 1 hour\n\n**What We Help With:**\n• Device connectivity issues\n• Dashboard customization\n• API integration\n• Mobile app deployment\n• Data visualization\n• Performance optimization\n\n**Resources:**\n• Getting started guide\n• Troubleshooting checklist\n• Best practices documentation\n• Sample code and examples\n\nHow can I help you today?",
        quickActions: ["Browse documentation", "Contact support", "Community forum", "Schedule a call"]
      }
    },

    // Greetings
    greeting: {
      patterns: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'greetings'],
      response: {
        text: "👋 Hello! I'm your IoT Dashboard Assistant.\n\nI'm here to help you with everything about our IoT platform:\n\n• Getting started and setup\n• Hardware compatibility\n• Security and compliance\n• Mobile app development\n• Analytics and dashboards\n• Pricing and plans\n• Technical support\n\nWhat would you like to know? Feel free to ask me anything!",
        quickActions: ["Getting started guide", "Platform overview", "Pricing information", "Contact support"]
      }
    }
  }

  // Enhanced response logic with better pattern matching
  const getBotResponse = (message) => {
    const lowerMessage = message.toLowerCase()
    
    // Check each category for pattern matches
    for (const [category, data] of Object.entries(qaDatabase)) {
      const hasMatch = data.patterns.some(pattern => lowerMessage.includes(pattern))
      if (hasMatch) {
        return data.response
      }
    }
    
    // Default response for unmatched queries
    return {
      text: `I understand you're asking about: "${message}"\n\nI'm here to help with questions about our IoT Dashboard platform. You can ask me about:\n\n• Getting started and setup\n• Hardware compatibility (Arduino, ESP32, Raspberry Pi)\n• Security features and compliance\n• Mobile app building (no-code)\n• Analytics and data visualization\n• Pricing and subscription plans\n• Technical support and troubleshooting\n\nTry asking something like:\n• "How do I connect my Arduino?"\n• "What's included in the free plan?"\n• "How secure is the platform?"\n• "Can I build mobile apps without coding?"`,
      quickActions: ["How to get started?", "What devices are supported?", "Is it secure?", "What does it cost?"]
    }
  }

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 1,
        text: "👋 Welcome to IoT Dashboard Assistant!\n\nI'm here to help you with everything about our IoT platform:\n\n🚀 **Getting Started** - Setup guides and tutorials\n🔧 **Hardware Support** - Arduino, ESP32, Raspberry Pi, and more\n🔒 **Security** - Enterprise-grade protection and compliance\n📱 **Mobile Apps** - No-code app builder\n📊 **Analytics** - Advanced data visualization\n💰 **Pricing** - Flexible plans for every need\n🛠️ **Support** - Technical help and documentation\n\nWhat would you like to know? Feel free to ask me anything!",
        sender: 'bot',
        timestamp: new Date(),
        quickActions: ["Getting started guide", "Hardware compatibility", "Security features", "Pricing plans"]
      }])
    }
  }, [isOpen, messages.length])

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isOpen, isMinimized])

  const handleSendMessage = async (message = inputValue) => {
    if (!message.trim()) return

    const userMessage = {
      id: Date.now(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Simulate typing delay
    setTimeout(() => {
      const botResponse = getBotResponse(message)
      const botMessage = {
        id: Date.now() + 1,
        text: botResponse.text,
        sender: 'bot',
        timestamp: new Date(),
        quickActions: botResponse.quickActions
      }
      
      setMessages(prev => [...prev, botMessage])
      setIsTyping(false)
    }, 1000 + Math.random() * 1000)
  }

  const handleQuickAction = (action) => {
    handleSendMessage(action)
  }

  const handleDefaultQuestion = (question) => {
    handleSendMessage(question.text)
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Getting Started': return <Zap className="w-4 h-4" />
      case 'Hardware': return <Cpu className="w-4 h-4" />
      case 'Security': return <Shield className="w-4 h-4" />
      case 'Mobile Apps': return <Smartphone className="w-4 h-4" />
      case 'Analytics': return <BarChart3 className="w-4 h-4" />
      case 'Pricing': return <HelpCircle className="w-4 h-4" />
      default: return <MessageCircle className="w-4 h-4" />
    }
  }

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center z-50 group transform hover:scale-105"
        >
          <MessageCircle className="w-7 h-7" />
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full flex items-center justify-center shadow-lg">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          </div>
          <div className="absolute right-20 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 shadow-lg">
            <div className="absolute right-0 top-1/2 transform translate-x-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
            Need help? Chat with us!
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 w-96 sm:w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 transition-all duration-500 transform ${
          isMinimized ? 'h-16 scale-95' : 'h-[600px] scale-100'
        }`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-t-2xl flex items-center justify-between backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">IoT Assistant</h3>
                <div className="flex items-center space-x-2 text-sm text-red-100">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
                  <span>Online • Ready to help</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-2 hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110"
              >
                {isMinimized ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[300px] sm:h-[400px] bg-gradient-to-b from-gray-50 to-white chatbot-messages">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                    <div className={`flex space-x-3 max-w-[85%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${
                        message.sender === 'user' 
                          ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' 
                          : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 border border-gray-200'
                      }`}>
                        {message.sender === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                      </div>
                      <div className={`rounded-2xl p-4 shadow-sm ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                          : 'bg-white text-gray-900 border border-gray-100'
                      }`}>
                        <p className="text-sm whitespace-pre-line leading-relaxed">{message.text}</p>
                        <div className={`text-xs mt-2 ${
                          message.sender === 'user' ? 'text-red-100' : 'text-gray-500'
                        }`}>
                          {formatTime(message.timestamp)}
                        </div>
                        
                        {/* Quick Actions */}
                        {message.quickActions && message.sender === 'bot' && (
                          <div className="mt-4 space-y-2">
                            {message.quickActions.map((action, index) => (
                              <button
                                key={index}
                                onClick={() => handleQuickAction(action)}
                                className="block w-full text-left text-xs bg-gray-100 hover:bg-gray-200 rounded-lg px-3 py-2 transition-all duration-200 hover:shadow-sm border border-gray-200"
                              >
                                {action}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start animate-fadeIn">
                    <div className="flex space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 flex items-center justify-center shadow-lg border border-gray-200">
                        <Bot className="w-5 h-5" />
                      </div>
                      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Default Questions */}
              {messages.length <= 1 && (
                <div className="p-4 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <h4 className="text-sm font-semibold text-gray-800 mb-4 flex items-center">
                    <Zap className="w-4 h-4 mr-2 text-red-500" />
                    Quick Questions
                  </h4>
                  <div className="space-y-3">
                    {defaultQuestions.slice(0, 3).map((question) => (
                      <button
                        key={question.id}
                        onClick={() => handleDefaultQuestion(question)}
                        className="w-full text-left p-3 text-sm bg-white hover:bg-gray-50 rounded-xl border border-gray-200 transition-all duration-200 hover:shadow-sm hover:border-red-200 flex items-center space-x-3 group"
                      >
                        <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center group-hover:bg-red-100 transition-colors">
                        {getCategoryIcon(question.category)}
                        </div>
                        <span className="text-gray-700 group-hover:text-gray-900">{question.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-4 border-t border-gray-100 bg-white">
                <div className="flex space-x-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-all duration-200"
                    disabled={isTyping}
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputValue.trim() || isTyping}
                    className="px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}

export default ChatBot
