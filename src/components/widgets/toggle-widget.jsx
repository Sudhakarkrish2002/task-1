import React from 'react'
import { MapPin } from 'lucide-react'

export const ToggleWidget = ({ name, status, location }) => {
  return (
    <div className="w-full h-full p-3 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden">
      <div className="flex justify-between items-start mb-2 min-h-0">
        <h3 className="text-sm font-semibold text-gray-900 truncate flex-1">{name}</h3>
        <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 ${
          status ? 'bg-blue-500' : 'bg-gray-300'
        }`}>
          <span
            className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform shadow-sm ${
              status ? 'translate-x-5' : 'translate-x-1'
            }`}
          />
        </div>
      </div>
      
      <div className="flex items-center text-xs text-gray-500 min-h-0">
        <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
        <span className="truncate">{location}</span>
      </div>
    </div>
  )
}
