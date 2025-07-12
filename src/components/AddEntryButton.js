'use client'
import { useState } from 'react'
import AddEntryModal from './AddEntryModal'

export default function AddEntryButton({ type }) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
      >
        <span>+</span>
        <span>Add {type.slice(0, -1)}</span>
      </button>

      {isModalOpen && (
        <AddEntryModal
          type={type}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  )
}
