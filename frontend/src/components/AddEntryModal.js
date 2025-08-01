'use client'
import { useState } from 'react'
import { apiService } from '../services/apiService'

const formFields = {
  movies: [
    { name: 'title', label: 'Movie Title', type: 'text', required: true },
    { name: 'rating', label: 'Rating (1-10)', type: 'number', min: 1, max: 10, required: true },
    { name: 'favoriteAspect', label: 'What I liked most', type: 'textarea', required: true },
    { name: 'dateWatched', label: 'Date Watched', type: 'date', required: true },
    { name: 'tags', label: 'Tags (comma separated)', type: 'text' }
  ],
  books: [
    { name: 'title', label: 'Book Title', type: 'text', required: true },
    { name: 'author', label: 'Author', type: 'text', required: true },
    { name: 'rating', label: 'Rating (1-10)', type: 'number', min: 1, max: 10, required: true },
    { name: 'keyTakeaway', label: 'Key Takeaway', type: 'textarea', required: true },
    { name: 'dateRead', label: 'Date Read', type: 'date', required: true },
    { name: 'tags', label: 'Tags (comma separated)', type: 'text' }
  ],
  trips: [
    { name: 'title', label: 'Trip Title', type: 'text', required: true },
    { name: 'destination', label: 'Destination', type: 'text', required: true },
    { name: 'startDate', label: 'Start Date', type: 'date', required: true },
    { name: 'endDate', label: 'End Date', type: 'date', required: true },
    { name: 'highlight', label: 'Trip Highlight', type: 'textarea', required: true },
    { name: 'tags', label: 'Tags (comma separated)', type: 'text' }
  ],
  restaurants: [
    { name: 'name', label: 'Restaurant Name', type: 'text', required: true },
    { name: 'location', label: 'Location', type: 'text', required: true },
    { name: 'cuisine', label: 'Cuisine Type', type: 'text', required: true },
    { name: 'rating', label: 'Rating (1-10)', type: 'number', min: 1, max: 10, required: true },
    { name: 'favoriteDish', label: 'Favorite Dish', type: 'text', required: true },
    { name: 'dateVisited', label: 'Date Visited', type: 'date', required: true },
    { name: 'tags', label: 'Tags (comma separated)', type: 'text' }
  ]
}

export default function AddEntryModal({ type, onClose, onEntryAdded, editEntry = null }) {
  const [formData, setFormData] = useState(() => {
    if (editEntry) {
      // Initialize form with existing entry data
      const initialData = { ...editEntry }
      // Convert tags array back to comma-separated string
      if (initialData.tags && Array.isArray(initialData.tags)) {
        initialData.tags = initialData.tags.join(', ')
      }
      // Format dates for input fields
      if (initialData.dateWatched) {
        initialData.dateWatched = new Date(initialData.dateWatched).toISOString().split('T')[0]
      }
      if (initialData.dateRead) {
        initialData.dateRead = new Date(initialData.dateRead).toISOString().split('T')[0]
      }
      if (initialData.dateVisited) {
        initialData.dateVisited = new Date(initialData.dateVisited).toISOString().split('T')[0]
      }
      if (initialData.startDate) {
        initialData.startDate = new Date(initialData.startDate).toISOString().split('T')[0]
      }
      if (initialData.endDate) {
        initialData.endDate = new Date(initialData.endDate).toISOString().split('T')[0]
      }
      return initialData
    }
    return {}
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const fields = formFields[type] || []
  const isEditing = !!editEntry

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      // Process tags
      const processedData = { ...formData }
      if (processedData.tags) {
        processedData.tags = processedData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      }

      console.log('Submitting data:', processedData) // Debug log

      // Use the appropriate API service method based on type and operation
      let result
      if (isEditing) {
        // Update existing entry
        switch (type) {
          case 'movies':
            result = await apiService.updateMovie(editEntry.id, processedData)
            break
          case 'books':
            result = await apiService.updateBook(editEntry.id, processedData)
            break
          case 'trips':
            result = await apiService.updateTrip(editEntry.id, processedData)
            break
          case 'restaurants':
            result = await apiService.updateRestaurant(editEntry.id, processedData)
            break
          default:
            throw new Error(`Unknown type: ${type}`)
        }
      } else {
        // Create new entry
        switch (type) {
          case 'movies':
            result = await apiService.createMovie(processedData)
            break
          case 'books':
            result = await apiService.createBook(processedData)
            break
          case 'trips':
            result = await apiService.createTrip(processedData)
            break
          case 'restaurants':
            result = await apiService.createRestaurant(processedData)
            break
          default:
            throw new Error(`Unknown type: ${type}`)
        }
      }

      console.log('Response:', result) // Debug log
      
      onClose()
      if (onEntryAdded) {
        onEntryAdded()
      }
    } catch (error) {
      setError(`Failed to ${isEditing ? 'update' : 'add'} entry. Please try again.`)
      console.error(`Error ${isEditing ? 'updating' : 'adding'} entry:`, error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {isEditing ? `Edit ${type.slice(0, -1)}` : `Add New ${type.slice(0, -1)}`}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            {fields.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label}
                  {field.required && <span className="text-red-500">*</span>}
                </label>
                
                {field.type === 'textarea' ? (
                  <textarea
                    required={field.required}
                    value={formData[field.name] || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                  />
                ) : (
                  <input
                    type={field.type}
                    required={field.required}
                    min={field.min}
                    max={field.max}
                    value={formData[field.name] || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                  />
                )}
              </div>
            ))}

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update Entry' : 'Add Entry')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
