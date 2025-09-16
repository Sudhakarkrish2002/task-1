import React from 'react'
import { Bell, AlertTriangle, CheckCircle, Info, X, Eye } from 'lucide-react'
import { useAutoValue } from '../../hooks/useAutoValue'

export const NotificationWidget = ({ 
  widgetId,
  title = 'Notifications',
  panelId = 'default',
  autoGenerate = true
}) => {
  const { value: notifications, connected, setValue: setNotifications, deviceInfo } = useAutoValue(
    widgetId, 
    'notification', 
    {}, 
    panelId, 
    autoGenerate
  )

  // Ensure notifications is always an array
  const safeNotifications = Array.isArray(notifications) ? notifications : []


  const getIcon = (type) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />
      default: return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  const getBgColor = (type) => {
    switch (type) {
      case 'warning': return 'bg-yellow-50 border-yellow-200'
      case 'error': return 'bg-red-50 border-red-200'
      case 'success': return 'bg-green-50 border-green-200'
      default: return 'bg-blue-50 border-blue-200'
    }
  }

  const markAsRead = (id) => {
    setNotifications(prev => {
      const safePrev = Array.isArray(prev) ? prev : []
      return safePrev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    })
  }

  const removeNotification = (id) => {
    setNotifications(prev => {
      const safePrev = Array.isArray(prev) ? prev : []
      return safePrev.filter(n => n.id !== id)
    })
  }

  const formatTime = (timestamp) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffMs = now - time
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    return `${Math.floor(diffMins / 60)}h ago`
  }

  const unreadCount = safeNotifications.filter(n => !n.read).length

  return (
    <div className="w-full h-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <Bell className="w-4 h-4 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-800 truncate">{title}</h3>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[18px] text-center">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <span className="text-xs text-gray-500">{connected ? 'Live' : 'Offline'}</span>
        </div>
      </div>
      
      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto p-2">
        {safeNotifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No notifications</p>
          </div>
        ) : (
          <div className="space-y-2">
            {safeNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-2 rounded-lg border ${
                  notification.read ? 'bg-gray-50' : getBgColor(notification.type)
                } transition-all duration-200`}
              >
                <div className="flex items-start space-x-2">
                  <div className="flex-shrink-0 mt-0.5">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-xs font-medium truncate ${
                        notification.read ? 'text-gray-600' : 'text-gray-900'
                      }`}>
                        {notification.title}
                      </h4>
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-0.5 text-gray-400 hover:text-gray-600"
                            title="Mark as read"
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          onClick={() => removeNotification(notification.id)}
                          className="p-0.5 text-gray-400 hover:text-red-600"
                          title="Remove"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <p className={`text-xs mt-1 ${
                      notification.read ? 'text-gray-500' : 'text-gray-700'
                    }`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatTime(notification.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="px-3 pb-2">
        <div className="text-xs text-gray-500 text-center">
          {deviceInfo ? `${deviceInfo.manufacturer} ${deviceInfo.model}` : 'Real-time notifications'}
        </div>
      </div>
    </div>
  )
}