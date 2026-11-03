'use client'

import { useEffect, useState } from 'react'
import { apiService } from '../../../services/apiService'
import { useAdminMode } from '../../../components/AdminModeContext'
import ConfirmDialog from '../../../components/ConfirmDialog'

export default function UpscNotesPage() {
  const { isAdminMode } = useAdminMode()
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [deletingNote, setDeletingNote] = useState(null)
  const [form, setForm] = useState({ topic: '', content: '' })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    loadNotes()
  }, [])

  const loadNotes = async () => {
    try {
      setError('')
      const data = await apiService.getAllUpscNotes()
      setNotes(data || [])
    } catch (loadError) {
      console.error('Error loading UPSC notes:', loadError)
      setError('Failed to load UPSC notes. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const openCreateForm = () => {
    setEditingNote(null)
    setForm({ topic: '', content: '' })
    setFormError('')
    setShowForm(true)
  }

  const openEditForm = (note) => {
    setEditingNote(note)
    setForm({ topic: note.topic, content: note.content })
    setFormError('')
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingNote(null)
    setFormError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setFormError('')

    try {
      if (editingNote) {
        await apiService.updateUpscNote(editingNote.id, form)
      } else {
        await apiService.createUpscNote(form)
      }
      closeForm()
      await loadNotes()
    } catch (saveError) {
      console.error('Error saving UPSC note:', saveError)
      setFormError('Could not save this note. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingNote) return

    try {
      await apiService.deleteUpscNote(deletingNote.id)
      setNotes(currentNotes => currentNotes.filter(note => note.id !== deletingNote.id))
      setDeletingNote(null)
    } catch (deleteError) {
      console.error('Error deleting UPSC note:', deleteError)
      setError('Could not delete this note. Please try again.')
      setDeletingNote(null)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="page-title mb-2">UPSC Notes</h1>
            <p className="text-purple-200">Topics, thoughts, and notes from my UPSC preparation.</p>
          </div>
          {isAdminMode && (
            <button
              onClick={openCreateForm}
              className="self-start bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 shadow-lg"
            >
              + Add Note
            </button>
          )}
        </div>

        {error && (
          <div role="alert" className="mb-6 text-red-300">{error}</div>
        )}

        {loading ? (
          <div className="text-center py-12 text-purple-200">Loading UPSC notes...</div>
        ) : notes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-xl font-semibold text-white mb-2">No notes yet</h2>
            <p className="text-purple-200">
              {isAdminMode ? 'Add a topic and share your thoughts on it.' : 'Notes will appear here when they are added.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {notes.map(note => (
              <article key={note.id} className="glass-card-bright card-hover reveal overflow-hidden">
                <header className="px-5 pt-5 pb-4 sm:px-6 border-b border-white/10 flex justify-between items-start gap-4">
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-white">{note.topic}</h2>
                    <time className="text-xs uppercase tracking-wider text-purple-200" dateTime={note.dateAdded}>
                      {new Date(note.dateAdded).toLocaleDateString()}
                    </time>
                  </div>
                  {isAdminMode && (
                    <div className="flex gap-3 shrink-0">
                      <button onClick={() => openEditForm(note)} className="text-purple-200 hover:text-white text-sm font-medium">
                        Edit
                      </button>
                      <button onClick={() => setDeletingNote(note)} className="text-red-300 hover:text-white text-sm font-medium">
                        Delete
                      </button>
                    </div>
                  )}
                </header>
                <p className="p-5 sm:p-6 text-white whitespace-pre-wrap leading-relaxed">{note.content}</p>
              </article>
            ))}
          </div>
        )}
      </div>

      {isAdminMode && showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#0a0011] border border-purple-900 rounded-lg p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-white">{editingNote ? 'Edit UPSC Note' : 'Add UPSC Note'}</h2>
              <button onClick={closeForm} className="text-purple-200 hover:text-white text-2xl" aria-label="Close">
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && <p role="alert" className="text-red-300">{formError}</p>}
              <div>
                <label htmlFor="upsc-topic" className="block text-sm font-medium text-purple-100 mb-2">Topic</label>
                <input
                  id="upsc-topic"
                  required
                  maxLength={200}
                  value={form.topic}
                  onChange={event => setForm(current => ({ ...current, topic: event.target.value }))}
                  placeholder="e.g. Federalism"
                  className="w-full px-4 py-3 rounded-md border border-gray-700 bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label htmlFor="upsc-content" className="block text-sm font-medium text-purple-100 mb-2">Your thoughts</label>
                <textarea
                  id="upsc-content"
                  required
                  rows={8}
                  value={form.content}
                  onChange={event => setForm(current => ({ ...current, content: event.target.value }))}
                  placeholder="Write your thoughts or notes about this topic..."
                  className="w-full px-4 py-3 rounded-md border border-gray-700 bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={closeForm} className="px-4 py-2 text-gray-200 hover:text-white">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-md bg-purple-700 hover:bg-purple-600 text-white disabled:opacity-60"
                >
                  {saving ? 'Saving...' : editingNote ? 'Save Changes' : 'Save Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isAdminMode && deletingNote && (
        <ConfirmDialog
          isOpen={true}
          onConfirm={handleDelete}
          onCancel={() => setDeletingNote(null)}
          title="Delete UPSC Note"
          message={`Delete the note on "${deletingNote.topic}"? This cannot be undone.`}
          confirmText="Delete"
        />
      )}
    </div>
  )
}
