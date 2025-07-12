'use client'
import { useState } from 'react'

export default function EntryCard({ type, entry, fields }) {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
          {entry.title || entry.name}
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Edit
          </button>
          <button className="text-red-600 hover:text-red-800 text-sm">
            Delete
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {fields.map((field, index) => (
          <div key={index} className="flex items-start space-x-2">
            {field.icon && <span className="text-sm mt-0.5">{field.icon}</span>}
            <div className="flex-1 min-w-0">
              <span className="text-sm font-medium text-gray-600">{field.label}:</span>
              <p className="text-sm text-gray-900 break-words">{field.value}</p>
            </div>
          </div>
        ))}
      </div>

      {entry.tags && entry.tags.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {entry.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Added {new Date(entry.dateAdded).toLocaleDateString()}
        </p>
      </div>
    </div>
  )
}
