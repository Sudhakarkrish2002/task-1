import { useState, useEffect } from 'react'
import { X, Copy, Check, Mail, User, Lock, Share2, Eye, Edit } from 'lucide-react'

const PanelSharing = ({ isOpen, onClose, panelName, panelId }) => {
  const [shareLink, setShareLink] = useState('')
  const [sharePassword, setSharePassword] = useState('')
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedPassword, setCopiedPassword] = useState(false)
  const [shareMode, setShareMode] = useState('view') // 'view' or 'edit'
  const [expiryDate, setExpiryDate] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    if (isOpen && panelId) {
      generateShareLink()
    }
  }, [isOpen, panelId])

  const generateShareLink = async () => {
    setIsGenerating(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const baseUrl = window.location.origin
    const generatedPassword = Math.random().toString(36).substring(2, 8).toUpperCase()
    const generatedLink = `${baseUrl}/shared/${panelId}`
    
    setShareLink(generatedLink)
    setSharePassword(generatedPassword)
    setIsGenerating(false)
  }

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === 'link') {
        setCopiedLink(true)
        setTimeout(() => setCopiedLink(false), 2000)
      } else {
        setCopiedPassword(true)
        setTimeout(() => setCopiedPassword(false), 2000)
      }
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  const handleShare = () => {
    // Here you would typically send the share link via email or other methods
    alert('Share link copied to clipboard!')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Share2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Share Dashboard</h3>
                <p className="text-sm text-gray-500">{panelName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Share Mode Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Share Permissions
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShareMode('view')}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    shareMode === 'view'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Eye className={`w-5 h-5 ${shareMode === 'view' ? 'text-red-600' : 'text-gray-400'}`} />
                    <div>
                      <div className="font-medium text-gray-900">View Only</div>
                      <div className="text-sm text-gray-500">Can view but not edit</div>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => setShareMode('edit')}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    shareMode === 'edit'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Edit className={`w-5 h-5 ${shareMode === 'edit' ? 'text-red-600' : 'text-gray-400'}`} />
                    <div>
                      <div className="font-medium text-gray-900">Can Edit</div>
                      <div className="text-sm text-gray-500">Can view and edit</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Share Link */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Share Link
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 font-mono text-sm"
                />
                <button
                  onClick={() => copyToClipboard(shareLink, 'link')}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center space-x-2"
                >
                  {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Access Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Access Password
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={sharePassword}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600 font-mono text-lg font-bold text-center"
                />
                <button
                  onClick={() => copyToClipboard(sharePassword, 'password')}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center space-x-2"
                >
                  {copiedPassword ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedPassword ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link Expiry (Optional)
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Sharing Instructions */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-red-900 mb-2">How to Share:</h4>
              <ol className="text-sm text-red-800 space-y-1 list-decimal list-inside">
                <li>Copy the share link above</li>
                <li>Share the link and password with your team</li>
                <li>Recipients can access the dashboard using the password</li>
                <li>Permissions are set to: <strong>{shareMode === 'view' ? 'View Only' : 'Can Edit'}</strong></li>
              </ol>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handleShare}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PanelSharing
