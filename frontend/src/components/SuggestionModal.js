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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50 overflow-x-hidden" style={{paddingBottom: 'env(safe-area-inset-bottom)'}}>
      <div className="bg-surface rounded-lg w-full max-w-[98vw] sm:max-w-md md:max-w-lg max-h-[90dvh] overflow-y-auto shadow-2xl border border-line" style={{boxSizing: 'border-box'}}>
        <div className="p-2 sm:p-4 md:p-6">
          <div className="flex justify-between items-center mb-6">
            {typeof type === 'string' ? (
              <h2 className="text-xl font-bold text-ink">Suggest a {type.slice(0, -1)}</h2>
            ) : title ? (
              <h2 className="text-xl font-bold text-ink">{title}</h2>
            ) : null}
            <button onClick={onClose} className="text-muted hover:text-ink">&times;</button>
          </div>
          {/* Render children if provided (read-only modal) */}
          {children}
          {/* Render form only if type is provided */}
          {typeof type === 'string' && (
            <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-3 md:space-y-4">
              {error && <div className="bg-danger-soft border border-danger text-danger px-4 py-3">{error}</div>}
              <input name="name" type="text" placeholder="Your Name (optional)" value={formData.name} onChange={handleInputChange} className="w-full px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 bg-surface text-ink placeholder-faint outline-none focus:ring-2 focus:ring-accent/30 text-xs sm:text-sm md:text-base" />
              <input name="itemName" type="text" placeholder={`Suggested ${type.slice(0, -1)} Name`} value={formData.itemName} onChange={handleInputChange} className="w-full px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 bg-surface text-ink placeholder-faint outline-none focus:ring-2 focus:ring-accent/30 text-xs sm:text-sm md:text-base" />
              <textarea name="message" placeholder="Why do you suggest this?" value={formData.message} onChange={handleInputChange} className="w-full px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 bg-surface text-ink placeholder-faint outline-none focus:ring-2 focus:ring-accent/30 text-xs sm:text-sm md:text-base" rows={3} required />
              <input name="moment" type="text" placeholder="Special moment (optional)" value={formData.moment} onChange={handleInputChange} className="w-full px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 bg-surface text-ink placeholder-faint outline-none focus:ring-2 focus:ring-accent/30 text-xs sm:text-sm md:text-base" />
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-line text-muted hover:bg-sunken">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 text-on-accent disabled:opacity-50 bg-accent hover:bg-accent-hover">{isSubmitting ? 'Submitting...' : 'Submit Suggestion'}</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
