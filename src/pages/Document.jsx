import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  FileText, 
  Calendar,
  User,
  Tag,
  Eye,
  Edit,
  Trash2,
  Plus
} from 'lucide-react'

function Document() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [documents, setDocuments] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // Generate sample documents
  useEffect(() => {
    const sampleDocuments = [
      {
        id: 1,
        title: 'IoT Device Configuration Manual',
        type: 'PDF',
        size: '2.4 MB',
        status: 'published',
        author: 'John Doe',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-20',
        tags: ['configuration', 'manual', 'devices'],
        description: 'Complete guide for configuring IoT devices in the dashboard'
      },
      {
        id: 2,
        title: 'MQTT Protocol Documentation',
        type: 'DOCX',
        size: '1.8 MB',
        status: 'draft',
        author: 'Jane Smith',
        createdAt: '2024-01-10',
        updatedAt: '2024-01-18',
        tags: ['mqtt', 'protocol', 'communication'],
        description: 'Detailed documentation of MQTT protocol implementation'
      },
      {
        id: 3,
        title: 'Dashboard API Reference',
        type: 'PDF',
        size: '3.2 MB',
        status: 'published',
        author: 'Mike Johnson',
        createdAt: '2024-01-05',
        updatedAt: '2024-01-22',
        tags: ['api', 'reference', 'dashboard'],
        description: 'Complete API reference for dashboard integration'
      },
      {
        id: 4,
        title: 'Widget Development Guide',
        type: 'MD',
        size: '856 KB',
        status: 'review',
        author: 'Sarah Wilson',
        createdAt: '2024-01-12',
        updatedAt: '2024-01-19',
        tags: ['widgets', 'development', 'guide'],
        description: 'Step-by-step guide for creating custom widgets'
      },
      {
        id: 5,
        title: 'Security Best Practices',
        type: 'PDF',
        size: '1.5 MB',
        status: 'published',
        author: 'David Brown',
        createdAt: '2024-01-08',
        updatedAt: '2024-01-21',
        tags: ['security', 'best-practices', 'guidelines'],
        description: 'Security guidelines and best practices for IoT systems'
      }
    ]
    setDocuments(sampleDocuments)
  }, [])

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesFilter = filterStatus === 'all' || doc.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'review': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'PDF': return '📄'
      case 'DOCX': return '📝'
      case 'MD': return '📋'
      default: return '📄'
    }
  }

  const handleViewDocument = (doc) => {
    alert(`Viewing document: ${doc.title}`)
  }

  const handleEditDocument = (doc) => {
    alert(`Editing document: ${doc.title}`)
  }

  const handleDeleteDocument = (doc) => {
    if (window.confirm(`Are you sure you want to delete "${doc.title}"?`)) {
      setDocuments(prev => prev.filter(d => d.id !== doc.id))
    }
  }

  const handleUploadDocument = () => {
    alert('Upload document functionality would be implemented here')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
              <p className="text-sm text-gray-600 mt-1">Manage your IoT documentation</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleUploadDocument}
              className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 w-64"
                />
              </div>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="review">Under Review</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((doc) => (
            <div key={doc.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{getTypeIcon(doc.type)}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">{doc.title}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>{doc.type}</span>
                      <span>•</span>
                      <span>{doc.size}</span>
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(doc.status)}`}>
                  {doc.status}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{doc.description}</p>
              
              <div className="flex flex-wrap gap-1 mb-4">
                {doc.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  {doc.author}
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(doc.updatedAt).toLocaleDateString()}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => handleViewDocument(doc)}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </button>
                <button 
                  onClick={() => handleEditDocument(doc)}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  title="Edit Document"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDeleteDocument(doc)}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-red-600 hover:text-red-800"
                  title="Delete Document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredDocuments.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Upload your first document to get started'
              }
            </p>
            {(!searchTerm && filterStatus === 'all') && (
              <button 
                onClick={handleUploadDocument}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                <Plus className="w-4 h-4 mr-2 inline" />
                Upload Document
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Document
