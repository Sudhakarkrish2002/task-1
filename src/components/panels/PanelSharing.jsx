import { useState, useEffect } from 'react'
import { 
  X, 
  UserPlus, 
  Mail, 
  Copy, 
  Check,
  Eye,
  Edit,
  Shield,
  Users,
  Link,
  AlertCircle,
  CheckCircle,
  User,
  AtSign
} from 'lucide-react'
import { usePanelStore } from '../../stores/usePanelStore'
import sharingService from '../../services/sharingService'

function PanelSharing({ isOpen, onClose, panelName = "Home Dashboard", panelId = null }) {
  const { panels, updatePanel } = usePanelStore()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [permission, setPermission] = useState('viewer')
  const [inputType, setInputType] = useState('email') // 'email' or 'username'
  const [validationError, setValidationError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [sharedUsers, setSharedUsers] = useState([])
  const [shareLink, setShareLink] = useState(
    panelId ? `https://dashboard.io/panel/share/${panelId}` : 'https://dashboard.io/panel/share/abc123'
  )
  const [linkCopied, setLinkCopied] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Load existing shared users when panel changes
  useEffect(() => {
    if (panelId && isOpen) {
      const panel = panels.find(p => p.id === panelId)
      if (panel && panel.sharedUsers) {
        setSharedUsers(panel.sharedUsers)
      }
      setShareLink(`https://dashboard.io/panel/share/${panelId}`)
    }
  }, [panelId, isOpen, panels])

  if (!isOpen) return null

  const validateInput = (input, type) => {
    if (!input.trim()) {
      return 'This field is required'
    }
    
    if (type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(input)) {
        return 'Please enter a valid email address'
      }
    } else if (type === 'username') {
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
      if (!usernameRegex.test(input)) {
        return 'Username must be 3-20 characters, letters, numbers, and underscores only'
      }
    }
    
    return ''
  }

  const handleAddUser = async (e) => {
    e.preventDefault()
    setValidationError('')
    setSuccessMessage('')
    
    const input = inputType === 'email' ? email : username
    
    try {
      // Validate input using sharing service (with fallback to client-side validation)
      let validation
      try {
        validation = await sharingService.validateUserInput(input, inputType)
      } catch (serviceError) {
        console.warn('Sharing service unavailable, using client-side validation:', serviceError)
        // Fallback to client-side validation
        const error = validateInput(input, inputType)
        if (error) {
          setValidationError(error)
          return
        }
        validation = { isValid: true, user: { name: inputType === 'email' ? input.split('@')[0] : input } }
      }
      
      if (!validation.isValid) {
        setValidationError(validation.errors[0])
        return
      }

      // Check if user already exists
      const existingUser = sharedUsers.find(user => 
        user.email === input || user.username === input
      )
      
      if (existingUser) {
        setValidationError('This user is already added to the panel')
        return
      }

      const newUser = {
        id: Date.now().toString(),
        email: inputType === 'email' ? input : '',
        username: inputType === 'username' ? input : '',
        name: validation.user.name,
        permission: permission,
        avatar: input.charAt(0).toUpperCase(),
        status: 'pending',
        addedAt: new Date().toISOString()
      }

      setSharedUsers([...sharedUsers, newUser])
      setEmail('')
      setUsername('')
      setSuccessMessage(`${inputType === 'email' ? 'Email' : 'Username'} added successfully!`)
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error adding user:', error)
      setValidationError('Error validating user. Please try again.')
    }
  }

  const handleRemoveUser = async (userId) => {
    try {
      // Try to remove user from panel using sharing service
      try {
        await sharingService.removeUserFromPanel(panelId, userId)
      } catch (serviceError) {
        console.warn('Sharing service unavailable, removing locally only:', serviceError)
        // Continue with local removal even if API fails
      }
      
      // Update local state
      setSharedUsers(sharedUsers.filter(user => user.id !== userId))
      setSuccessMessage('User removed successfully!')
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error removing user:', error)
      setValidationError('Error removing user. Please try again.')
    }
  }

  const handlePermissionChange = async (userId, newPermission) => {
    try {
      // Try to update user permission using sharing service
      try {
        await sharingService.updateUserPermission(panelId, userId, newPermission)
      } catch (serviceError) {
        console.warn('Sharing service unavailable, updating locally only:', serviceError)
        // Continue with local update even if API fails
      }
      
      // Update local state
      setSharedUsers(sharedUsers.map(user => 
        user.id === userId ? { ...user, permission: newPermission } : user
      ))
      setSuccessMessage('Permission updated successfully!')
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error updating permission:', error)
      setValidationError('Error updating permission. Please try again.')
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  const handleSaveChanges = async () => {
    if (!panelId) return
    
    setIsSaving(true)
    setValidationError('')
    setSuccessMessage('')
    
    try {
      // Try to save sharing settings using the sharing service
      try {
        await sharingService.sharePanel(panelId, sharedUsers)
        
        // Send notifications to newly added users
        const newUsers = sharedUsers.filter(user => user.status === 'pending')
        for (const user of newUsers) {
          try {
            await sharingService.sendSharingNotification(user.id, panelId, user.permission)
          } catch (notificationError) {
            console.warn('Failed to send notification to user:', user.email || user.username, notificationError)
          }
        }
      } catch (serviceError) {
        console.warn('Sharing service unavailable, saving locally only:', serviceError)
        // Continue with local storage even if API fails
      }
      
      // Update the panel with new shared users (always do this for local storage)
      updatePanel(panelId, {
        isShared: sharedUsers.length > 0,
        sharedUsers: sharedUsers,
        lastShared: new Date().toISOString()
      })
      
      // Show success message
      setSuccessMessage('Sharing settings saved successfully!')
      
      // Close modal after a short delay
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (error) {
      console.error('Error saving sharing settings:', error)
      setValidationError('Error saving sharing settings. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const getPermissionIcon = (permission) => {
    switch (permission) {
      case 'viewer':
        return <Eye className="w-4 h-4" />
      case 'editor':
        return <Edit className="w-4 h-4" />
      case 'admin':
        return <Shield className="w-4 h-4" />
      default:
        return <Eye className="w-4 h-4" />
    }
  }

  const getPermissionColor = (permission) => {
    switch (permission) {
      case 'viewer':
        return 'bg-blue-100 text-blue-800'
      case 'editor':
        return 'bg-red-100 text-red-800'
      case 'admin':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Share Panel</h2>
            <p className="text-sm text-gray-600 mt-1">Share "{panelName}" with team members</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Success/Error Messages */}
          {successMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <CheckCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700 text-sm">{successMessage}</span>
            </div>
          )}
          {validationError && !successMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700 text-sm">{validationError}</span>
            </div>
          )}
          {/* Share Link Section */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Link className="w-5 h-5 mr-2" />
              Share Link
            </h3>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
              />
              <button
                onClick={copyToClipboard}
                className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                {linkCopied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Anyone with this link can view the panel (if you've given them permission)
            </p>
          </div>

          {/* Add User Section */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <UserPlus className="w-5 h-5 mr-2" />
              Add Team Members
            </h3>
            
            {/* Input Type Toggle */}
            <div className="flex items-center space-x-2 mb-4">
              <button
                type="button"
                onClick={() => {
                  setInputType('email')
                  setEmail('')
                  setUsername('')
                  setValidationError('')
                }}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  inputType === 'email' 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </button>
              <button
                type="button"
                onClick={() => {
                  setInputType('username')
                  setEmail('')
                  setUsername('')
                  setValidationError('')
                }}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  inputType === 'username' 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                    : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
                }`}
              >
                <User className="w-4 h-4 mr-2" />
                Username
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex-1">
                  <div className="relative">
                    {inputType === 'email' ? (
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    ) : (
                      <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    )}
                    <input
                      type={inputType === 'email' ? 'email' : 'text'}
                      value={inputType === 'email' ? email : username}
                      onChange={(e) => {
                        if (inputType === 'email') {
                          setEmail(e.target.value)
                        } else {
                          setUsername(e.target.value)
                        }
                        setValidationError('')
                      }}
                      placeholder={inputType === 'email' ? 'Enter email address' : 'Enter username'}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        validationError ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {validationError && (
                    <div className="flex items-center mt-2 text-sm text-red-600">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {validationError}
                    </div>
                  )}
                  {successMessage && (
                    <div className="flex items-center mt-2 text-sm text-red-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      {successMessage}
                    </div>
                  )}
                </div>
                <div className="w-32">
                  <select
                    value={permission}
                    onChange={(e) => setPermission(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!email && !username}
                >
                  Add
                </button>
              </div>
            </form>
          </div>

          {/* Shared Users List */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Shared With ({sharedUsers.length})
            </h3>
            
            {sharedUsers.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500">No users have been shared with this panel yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sharedUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">{user.avatar}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-500">
                          {user.email && user.username ? (
                            <div>
                              <div>{user.email}</div>
                              <div>@{user.username}</div>
                            </div>
                          ) : (
                            user.email || `@${user.username}`
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <select
                        value={user.permission}
                        onChange={(e) => handlePermissionChange(user.id, e.target.value)}
                        className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                      >
                        <option value="viewer">Viewer</option>
                        <option value="editor">Editor</option>
                        <option value="admin">Admin</option>
                      </select>
                      
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                      
                      <button
                        onClick={() => handleRemoveUser(user.id)}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Permission Types Explanation */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Permission Types</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-blue-500" />
                <span><strong>Viewer:</strong> Can view the panel but cannot make changes</span>
              </div>
              <div className="flex items-center space-x-2">
                <Edit className="w-4 h-4 text-red-500" />
                <span><strong>Editor:</strong> Can view and edit the panel layout and widgets</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-purple-500" />
                <span><strong>Admin:</strong> Full access including sharing and deletion</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Always visible at bottom */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button 
            onClick={handleSaveChanges}
            disabled={isSaving}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PanelSharing
