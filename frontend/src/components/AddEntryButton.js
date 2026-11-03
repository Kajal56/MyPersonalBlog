'use client'
import { useState } from 'react'
import AddEntryModal from './AddEntryModal'

export default function AddEntryButton({ type, onEntryAdded }) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleEntryAdded = () => {
    setIsModalOpen(false)
    if (onEntryAdded) {
      onEntryAdded()
    }
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
  className="bg-accent hover:bg-accent text-on-accent px-6 py-3 font-medium transition-colors flex items-center space-x-2"
      >
        <span>+</span>
        <span>Add {type.slice(0, -1)}</span>
      </button>

      {isModalOpen && (
        <AddEntryModal
          type={type}
          onClose={() => setIsModalOpen(false)}
          onEntryAdded={handleEntryAdded}
        />
      )}
    </>
  )
}
