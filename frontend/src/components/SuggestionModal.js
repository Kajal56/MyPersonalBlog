'use client'
import { useState } from 'react'
import { apiService } from '../services/apiService'

export default function SuggestionModal({ type, onClose, onSuggestionAdded, children, title }) {
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
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-2 sm:p-4 z-50 overflow-x-hidden" style={{paddingBottom: 'env(safe-area-inset-bottom)'}}>
      <div className="bg-[#0a0011] rounded-lg w-full max-w-[98vw] sm:max-w-md md:max-w-lg max-h-[90dvh] overflow-y-auto shadow-2xl border border-[#181825]" style={{boxSizing: 'border-box'}}>
        <div className="p-2 sm:p-4 md:p-6">
          <div className="flex justify-between items-center mb-6">
            {typeof type === 'string' ? (
              <h2 className="text-xl font-bold text-white">Suggest a {type.slice(0, -1)}</h2>
            ) : title ? (
              <h2 className="text-xl font-bold text-white">{title}</h2>
            ) : null}
            <button onClick={onClose} className="text-purple-200 hover:text-white">&times;</button>
          </div>
          {/* Render children if provided (read-only modal) */}
          {children}
          {/* Render form only if type is provided */}
          {typeof type === 'string' && (
            <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-3 md:space-y-4">
              {error && <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3">{error}</div>}
              <input name="name" type="text" placeholder="Your Name (optional)" value={formData.name} onChange={handleInputChange} className="w-full px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 bg-[#191a2e] text-white placeholder-blue-200 outline-none focus:ring-2 focus:ring-blue-700 text-xs sm:text-sm md:text-base" />
              <input name="itemName" type="text" placeholder={`Suggested ${type.slice(0, -1)} Name`} value={formData.itemName} onChange={handleInputChange} className="w-full px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 bg-[#191a2e] text-white placeholder-blue-200 outline-none focus:ring-2 focus:ring-blue-700 text-xs sm:text-sm md:text-base" />
              <textarea name="message" placeholder="Why do you suggest this?" value={formData.message} onChange={handleInputChange} className="w-full px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 bg-[#191a2e] text-white placeholder-blue-200 outline-none focus:ring-2 focus:ring-blue-700 text-xs sm:text-sm md:text-base" rows={3} required />
              <input name="moment" type="text" placeholder="Special moment (optional)" value={formData.moment} onChange={handleInputChange} className="w-full px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 bg-[#191a2e] text-white placeholder-blue-200 outline-none focus:ring-2 focus:ring-blue-700 text-xs sm:text-sm md:text-base" />
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-purple-900 text-purple-200 hover:bg-purple-900">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 bg-gradient-to-r from-[#7D2AE8] to-[#6600CC] text-white hover:from-[#6600CC] hover:to-[#7D2AE8] disabled:opacity-50">{isSubmitting ? 'Submitting...' : 'Submit Suggestion'}</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
