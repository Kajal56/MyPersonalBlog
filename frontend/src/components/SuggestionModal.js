'use client'
import { useState } from 'react'
import { apiService } from '../services/apiService'

export default function SuggestionModal({ type, onClose, onSuggestionAdded }) {
  const [formData, setFormData] = useState({ name: '', itemName: '', message: '', moment: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    try {
        console.log('Submitting suggestion:', formData);

      await apiService.createSuggestion(type, formData)
      console.log('Suggestion submitted successfully');
      onClose()
      if (onSuggestionAdded) onSuggestionAdded()
    } catch (err) {
      setError('Failed to submit suggestion. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
  <div className="bg-white max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Suggest a {type.slice(0, -1)}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3">{error}</div>}
            <input name="name" type="text" placeholder="Your Name (optional)" value={formData.name} onChange={handleInputChange} className="w-full px-3 py-2 border" />
            <input name="itemName" type="text" placeholder={`Suggested ${type.slice(0, -1)} Name`} value={formData.itemName} onChange={handleInputChange} className="w-full px-3 py-2 border" />
            <textarea name="message" placeholder="Why do you suggest this?" value={formData.message} onChange={handleInputChange} className="w-full px-3 py-2 border" rows={3} required />
            <input name="moment" type="text" placeholder="Special moment (optional)" value={formData.moment} onChange={handleInputChange} className="w-full px-3 py-2 border" />
            <div className="flex space-x-3 pt-4">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border text-gray-700 hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">{isSubmitting ? 'Submitting...' : 'Submit Suggestion'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
