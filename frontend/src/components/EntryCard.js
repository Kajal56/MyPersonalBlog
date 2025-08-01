'use client'
import { useState } from 'react'

export default function EntryCard({ type, entry, fields, onEdit, onDelete }) {
  const [isEditing, setIsEditing] = useState(false)

  const handleEdit = () => {
    if (onEdit) {
      onEdit(entry)
    } else {
      setIsEditing(!isEditing)
    }
  }

  const handleDelete = async () => {
    console.log('Delete button clicked for entry:', entry.id)
    console.log('onDelete function:', onDelete)
    
    if (window.confirm('Are you sure you want to delete this entry?')) {
      if (onDelete) {
        try {
          console.log('Calling onDelete with id:', entry.id)
          await onDelete(entry.id)
          console.log('Delete successful')
        } catch (error) {
          console.error('Error deleting entry:', error)
          alert('Failed to delete entry: ' + error.message)
        }
      } else {
        console.log('onDelete function not provided')
      }
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
          {entry.title || entry.name}
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => alert('Edit clicked!')}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Edit
          </button>
          <button 
            onClick={() => {
              alert('DELETE BUTTON CLICKED!');
              console.log('Delete button clicked!');
              handleDelete();
            }}
            className="text-red-600 hover:text-red-800 text-sm"
            style={{ backgroundColor: 'yellow', padding: '10px' }}
          >
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
