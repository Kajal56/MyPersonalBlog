'use client'
import { useState } from 'react'

export default function ConfirmDialog({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?",
  confirmText = "Delete",
  cancelText = "Cancel"
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-surface rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-ink mb-4">{title}</h3>
        <p className="text-muted mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-muted bg-sunken rounded-md hover:bg-sunken transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-on-accent bg-danger rounded-md hover:bg-danger-soft transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
