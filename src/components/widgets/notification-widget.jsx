import React, { useState, useEffect } from 'react'
import { Bell, AlertTriangle, CheckCircle, Info, X, Eye } from 'lucide-react'

export const NotificationWidget = ({ 
  widgetId,
  mqttTopic,
  title = 'Notifications',
  maxNotifications = 10,
  size = 'medium'
}) => {
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      type: 'warning',
      title: 'High Temperature Alert',
      message: 'Temperature sensor A1 reading 35°C',
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      read: false,
      deviceId: 'device-1'
    },
    {
      id: '2',
      type: 'info',
      title: 'Device Connected',
      message: 'New device "Smart Switch B2" connected',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      read: false,
      deviceId: 'device-2'
    },
    {
      id: '3',
      type: 'success',
      title: 'Calibration Complete',
      message: 'Humidity sensor C3 calibration completed successfully',
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      read: true,
      deviceId: 'device-3'
    }
  ])

  const [unreadCount, setUnreadCount] = useState(0)

  // Update unread count
  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length
    setUnreadCount(unread)
  }, [notifications])

  // Subscribe to MQTT topic for notifications
  useEffect(() => {
    if (!mqttTopic) return

    const handleMqttMessage = (topic, messageData) => {
      if (topic === mqttTopic) {
        const newNotification = {
          id: Date.now().toString(),
          type: messageData.type || 'info',
          title: messageData.title || 'New Notification',
          message: messageData.message || 'Device update received',
          timestamp: new Date().toISOString(),
          read: false,
          deviceId: messageData.deviceId || 'unknown'
        }

        setNotifications(prev => {
          const updated = [newNotification, ...prev.slice(0, maxNotifications - 1)]
          return updated
        })
      }
    }


    return () => {
    }
  }, [mqttTopic, maxNotifications])


  const getNotificationIcon = (type) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'success':
        return <CheckCircle className="w-4 h-4 text-red-500" />
      default:
        return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  const getNotificationBgColor = (type) => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'success':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    )
  }

  const removeNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }

  const formatTime = (timestamp) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffMs = now - time
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  return (
    <div className="w-full h-full bg-white rounded-lg border border-gray-200 p-2 flex flex-col">
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <div className="flex items-center space-x-2 min-w-0">
          <Bell className="w-4 h-4 text-gray-600 flex-shrink-0" />
          <h3 className="text-sm font-semibold text-gray-900 truncate">{title}</h3>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[16px] text-center flex-shrink-0">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1 flex-shrink-0">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-500">Live</span>
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto min-h-0">
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No notifications</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-2 rounded border ${
                notification.read ? 'bg-gray-50' : getNotificationBgColor(notification.type)
              } transition-all duration-200`}
            >
              <div className="flex items-start space-x-2">
                <div className="flex-shrink-0 mt-0.5">
                  {getNotificationIcon(notification.type)}
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
                  <p className={`text-xs mt-1 line-clamp-2 ${
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
          ))
        )}
      </div>

      {notifications.length > 0 && unreadCount > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={markAllAsRead}
            className="w-full text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Mark all as read
          </button>
        </div>
      )}

      {mqttTopic && (
        <div className="mt-1 text-xs text-gray-400 text-center truncate flex-shrink-0">
          {mqttTopic}
        </div>
      )}
    </div>
  )
}
