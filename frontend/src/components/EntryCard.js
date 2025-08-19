'use client'
import { useState } from 'react'
import ConfirmDialog from './ConfirmDialog'
import { useAdminMode } from './AdminModeContext'

export default function EntryCard({ type, entry, fields, onEdit, onDelete, cardClassName }) {
  const { isAdminMode } = useAdminMode()
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleEdit = () => {
    if (onEdit) {
      onEdit(entry)
    } else {
      setIsEditing(!isEditing)
    }
  }

  const handleDeleteClick = () => {
    console.log('Delete button clicked for entry:', entry.id)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    console.log('Delete confirmed for entry:', entry.id)
    console.log('onDelete function:', onDelete)
    
    if (onDelete) {
      try {
        console.log('Calling onDelete with id:', entry.id)
        await onDelete(entry.id)
        console.log('Delete successful')
        setShowDeleteDialog(false)
      } catch (error) {
        console.error('Error deleting entry:', error)
        console.error('Failed to delete entry:', error.message)
        setShowDeleteDialog(false)
      }
    } else {
      console.log('onDelete function not provided')
      setShowDeleteDialog(false)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false)
  }

  return (
    <>
      <div className={cardClassName || "bg-gradient-to-br from-[#2D0036] to-[#6600CC] shadow-md p-6 hover:shadow-lg transition-shadow"}>
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-white line-clamp-2">
            {entry.title || entry.name}
          </h3>
          {isAdminMode && (
            <div className="flex space-x-2">
              <button
                onClick={handleEdit}
                className="text-purple-300 hover:text-white text-sm"
              >
                Edit
              </button>
              <button 
                onClick={handleDeleteClick}
                className="text-red-400 hover:text-white text-sm"
              >
                Delete
              </button>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={index} className="flex items-start space-x-2">
              {field.icon && <span className="text-sm mt-0.5 text-purple-300">{field.icon}</span>}
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-purple-200">{field.label}:</span>
                <p className="text-sm text-white break-words">{field.value}</p>
              </div>
            </div>
          ))}
        </div>

        {entry.tags && entry.tags.length > 0 && (
          <div className="mt-4 pt-4 border-t border-purple-900">
            <div className="flex flex-wrap gap-2">
              {entry.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-purple-900 text-purple-200 text-xs"
                  style={{ borderRadius: 0 }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        title="Delete Entry"
        message={`Are you sure you want to delete "${entry.title || entry.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  )
}
