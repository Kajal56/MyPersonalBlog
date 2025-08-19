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
  ],
  flats: [
    { name: 'name', label: 'Property/Flat Name', type: 'text', required: true },
    { name: 'contactNumber', label: 'Contact Number', type: 'tel', required: true },
    { name: 'societyName', label: 'Society Name', type: 'text', required: true },
    { name: 'googleMapsLink', label: 'Google Maps Link', type: 'url', required: false },
    { name: 'rentValue', label: 'Monthly Rent (₹)', type: 'number', min: 0, required: true },
    { name: 'remarks', label: 'Remarks/Notes', type: 'textarea', required: false }
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
          case 'flats':
            result = await apiService.updateFlat(editEntry.id, processedData)
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
          case 'flats':
            result = await apiService.createFlat(processedData)
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
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-2 sm:p-4 md:p-6 z-50" style={{paddingBottom: 'env(safe-area-inset-bottom)'}}>
      <div className="bg-[#0a0011] rounded-lg w-full max-w-[98vw] sm:max-w-md md:max-w-lg max-h-[90dvh] overflow-y-auto shadow-2xl border border-[#181825]" style={{boxSizing: 'border-box'}}>
        <div className="p-2 sm:p-4 md:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">
              {isEditing ? `Edit ${type.slice(0, -1)}` : `Add New ${type.slice(0, -1)}`}
            </h2>
            <button
              onClick={onClose}
              className="text-purple-200 hover:text-white"
            >
              &times;
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-3 md:space-y-4">
            {error && (
              <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            {fields.map((field) => (
              <div key={field.name}>
                <label className="block text-xs sm:text-sm md:text-base font-medium text-purple-200 mb-1 sm:mb-2">
                  {field.label}
                  {field.required && <span className="text-red-400">*</span>}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    required={field.required}
                    value={formData[field.name] || ''}
                    className="w-full px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 bg-[#191a2e] text-white placeholder-blue-200 rounded-md outline-none focus:ring-2 focus:ring-blue-700 text-xs sm:text-sm md:text-base"
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
                    className="w-full px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 bg-[#191a2e] text-white placeholder-blue-200 rounded-md outline-none focus:ring-2 focus:ring-blue-700 text-xs sm:text-sm md:text-base"
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                  />
                )}
              </div>
            ))}

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-purple-900 rounded-md text-purple-200 hover:bg-purple-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-[#7D2AE8] to-[#6600CC] text-white rounded-md hover:from-[#6600CC] hover:to-[#7D2AE8] disabled:opacity-50"
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
