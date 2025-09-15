import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNavigation } from '../hooks/useNavigation'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Copy, 
  Trash2, 
  Share2, 
  Calendar,
  Users,
  Settings,
  Grid3X3,
  List
} from 'lucide-react'
import { usePanels, usePanelActions, usePanelStore } from '../stores/usePanelStore'
import PanelSharing from '../components/panels/PanelSharing'
import CreateDashboardModal from '../components/CreateDashboardModal'

function MyPanels() {
  const navigate = useNavigate()
  const { handleNavigation } = useNavigation()
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'table'
  const [showSharingModal, setShowSharingModal] = useState(false)
  const [selectedPanel, setSelectedPanel] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [panelToDelete, setPanelToDelete] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  
  const panels = usePanels()
  const { deletePanel, updatePanel, removeDuplicates } = usePanelActions()

  const filteredPanels = panels
    .filter(panel => panel && panel.name && panel.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .map(panel => ({
      ...panel,
      // Ensure widgets is a number, not an array of objects
      widgets: Array.isArray(panel.widgets) ? panel.widgets.length : (typeof panel.widgets === 'number' ? panel.widgets : 0),
      // Ensure deviceCount is a number
      deviceCount: typeof panel.deviceCount === 'number' ? panel.deviceCount : 0,
      // Ensure createdBy exists
      createdBy: panel.createdBy || 'Unknown User',
      // Ensure isShared is boolean
      isShared: Boolean(panel.isShared),
      // Ensure name exists
      name: panel.name || 'Unnamed Panel',
      // Ensure id exists
      id: panel.id || Date.now().toString()
    }))


  // CRUD Operations
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


  const handleEditPanel = (panel) => {
    handleNavigation(`/create?edit=${panel.id}`)
  }

  const handleDuplicatePanel = (panel) => {
    const duplicatedPanel = {
      ...panel,
      id: Date.now().toString(),
      name: `${panel.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    usePanelStore.getState().createPanel(duplicatedPanel)
    alert('Panel duplicated successfully!')
  }

  const handleSharePanel = (panel) => {
    setSelectedPanel(panel)
    setShowSharingModal(true)
  }

  const handleDeletePanel = (panel) => {
    setPanelToDelete(panel)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = () => {
    if (panelToDelete) {
      deletePanel(panelToDelete.id)
      setShowDeleteConfirm(false)
      setPanelToDelete(null)
      alert('Panel deleted successfully!')
    }
  }

  const cancelDelete = () => {
    setShowDeleteConfirm(false)
    setPanelToDelete(null)
  }

  const formatTimeAgo = (dateString) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  // Add error boundary for safety
  if (!panels || !Array.isArray(panels)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Initializing panels...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Panels</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage your IoT dashboards</p>
          </div>
          <button 
            onClick={handleCreatePanel}
            className="flex items-center justify-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            <span className="text-sm sm:text-base">Create New Panel</span>
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          {/* Mobile Layout */}
          <div className="block md:hidden space-y-3">
            {/* Search Bar - Full Width */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search panels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 w-full"
              />
            </div>
            
            {/* View Mode Buttons - Centered */}
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg flex items-center justify-center ${viewMode === 'grid' ? 'bg-red-100 text-red-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg flex items-center justify-center ${viewMode === 'table' ? 'bg-red-100 text-red-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search panels..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 w-64"
                />
              </div>
              <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg flex items-center justify-center ${viewMode === 'grid' ? 'bg-red-100 text-red-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg flex items-center justify-center ${viewMode === 'table' ? 'bg-red-100 text-red-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Panels Content */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPanels.map((panel) => (
              <div key={panel.id} className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{panel.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {panel.deviceCount} devices
                      </div>
                      <div className="flex items-center">
                        <Settings className="w-4 h-4 mr-1" />
                        {panel.widgets} widgets
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {panel.isShared && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full" title="Shared"></div>
                    )}
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-1">Created by {panel.createdBy}</div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    Updated {formatTimeAgo(panel.updatedAt)}
                  </div>
                </div>
                
                {/* Mobile Button Layout */}
                <div className="block sm:hidden">
                  <div className="grid grid-cols-4 gap-2">
                    <button 
                      onClick={() => handleEditPanel(panel)}
                      className="flex items-center justify-center p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      title="Edit Panel"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDuplicatePanel(panel)}
                      className="flex items-center justify-center p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      title="Duplicate Panel"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleSharePanel(panel)}
                      className="flex items-center justify-center p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      title="Share Panel"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeletePanel(panel)}
                      className="flex items-center justify-center p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-red-600 hover:text-red-800"
                      title="Delete Panel"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Desktop Button Layout */}
                <div className="hidden sm:flex items-center space-x-2">
                  <button 
                    onClick={() => handleEditPanel(panel)}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDuplicatePanel(panel)}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    title="Duplicate Panel"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleSharePanel(panel)}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    title="Share Panel"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeletePanel(panel)}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-red-600 hover:text-red-800"
                    title="Delete Panel"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Panel Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Devices</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Widgets</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPanels.map((panel) => (
                  <tr key={panel.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">{panel.name}</div>
                        {panel.isShared && (
                          <div className="ml-2 w-2 h-2 bg-blue-500 rounded-full" title="Shared"></div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{panel.deviceCount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{panel.widgets}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{panel.createdBy}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatTimeAgo(panel.updatedAt)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleEditPanel(panel)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit Panel"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDuplicatePanel(panel)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Duplicate Panel"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleSharePanel(panel)}
                          className="text-purple-600 hover:text-purple-900"
                          title="Share Panel"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeletePanel(panel)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Panel"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredPanels.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No panels found</h3>
            <p className="text-gray-600 mb-4">Create your first IoT dashboard to get started</p>
            <button 
              onClick={handleCreatePanel}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Create New Panel
            </button>
          </div>
        )}
      </div>

      {/* Panel Sharing Modal */}
      <PanelSharing 
        isOpen={showSharingModal}
        onClose={() => setShowSharingModal(false)}
        panelName={selectedPanel?.name || "Panel"}
        panelId={selectedPanel?.id}
      />

      {/* Create Dashboard Modal */}
      <CreateDashboardModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateDashboard={handleCreateDashboard}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Panel</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete <strong>"{panelToDelete?.name}"</strong>? 
                This will permanently remove the panel and all its widgets.
              </p>
              
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Delete Panel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyPanels
