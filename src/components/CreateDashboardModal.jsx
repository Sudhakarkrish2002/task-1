import { useState } from 'react'
import { X, Plus, Wifi, Cpu, HardDrive } from 'lucide-react'

const CreateDashboardModal = ({ isOpen, onClose, onCreateDashboard }) => {
  const [dashboardName, setDashboardName] = useState('')
  const [selectedDevice, setSelectedDevice] = useState('esp32')
  const [selectedConnectivity, setSelectedConnectivity] = useState('wifi')
  const [projectDescription, setProjectDescription] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (dashboardName.trim()) {
      onCreateDashboard({
        name: dashboardName,
        device: selectedDevice,
        connectivity: selectedConnectivity,
        description: projectDescription,
        createdAt: new Date().toISOString()
      })
      setDashboardName('')
      setProjectDescription('')
      setSelectedDevice('esp32')
      setSelectedConnectivity('wifi')
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Create New Dashboard</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dashboard Name
              </label>
              <input
                type="text"
                value={dashboardName}
                onChange={(e) => setDashboardName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter dashboard name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose Device
              </label>
              <select
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="esp32">ESP32</option>
                <option value="esp8266">ESP8266</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose Connectivity
              </label>
              <select
                value={selectedConnectivity}
                onChange={(e) => setSelectedConnectivity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="wifi">Wi-Fi</option>
                <option value="ethernet">Ethernet</option>
                <option value="mqtt">MQTT</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Description
              </label>
              <textarea
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter project description"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateDashboardModal
