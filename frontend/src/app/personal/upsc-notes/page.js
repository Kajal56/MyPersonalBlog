'use client'

import { useEffect, useMemo, useState } from 'react'
import { apiService } from '../../../services/apiService'
import { useAdminMode } from '../../../components/AdminModeContext'
import ConfirmDialog from '../../../components/ConfirmDialog'
import { formatDate, linkLabel, readingTime, splitLinks } from '../../../utils/text'

const LONG_NOTE = 420

// Quick picks in the admin form; any custom tag can be typed too
const SUBJECTS = ['Polity', 'Economy', 'History', 'Geography', 'Environment', 'Science & Tech', 'Society', 'International Relations', 'Ethics', 'Current Affairs']

// Note text with URLs rendered as inline link chips
function NoteBody({ content, clamped }) {
  return (
    <p className={`whitespace-pre-wrap leading-relaxed text-white ${clamped ? 'line-clamp-6' : ''}`}>
      {splitLinks(content).map((part, i) =>
        part.isLink ? (
          <a
            key={i}
            href={part.text}
            target="_blank"
            rel="noopener noreferrer"
            className="mx-0.5 inline-flex items-center rounded border border-white/15 bg-black/25 px-2 py-0.5 align-baseline text-xs font-medium text-purple-100 transition-colors hover:border-purple-300/60 hover:text-white"
          >
            {linkLabel(part.text)}
          </a>
        ) : (
          <span key={i}>{part.text}</span>
        )
      )}
    </p>
  )
}

export default function UpscNotesPage() {
  const { isAdminMode } = useAdminMode()
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingNote, setEditingNote] = useState(null)
  const [deletingNote, setDeletingNote] = useState(null)
  const [form, setForm] = useState({ topic: '', content: '', tags: [] })
  const [customTag, setCustomTag] = useState('')
  const [activeTag, setActiveTag] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [openNotes, setOpenNotes] = useState(() => new Set())

  useEffect(() => {
    loadNotes()
  }, [])

  // Links from the home page point at #note-<id>: open that note and bring it into view
  useEffect(() => {
    if (loading || !window.location.hash.startsWith('#note-')) return
    const id = window.location.hash.slice('#note-'.length)
    setOpenNotes(prev => new Set(prev).add(id))
    requestAnimationFrame(() => document.getElementById(`note-${id}`)?.scrollIntoView({ behavior: 'smooth' }))
  }, [loading])

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

  // Tags in use, most common first, for the filter bar
  const tagCounts = useMemo(() => {
    const counts = new Map()
    notes.forEach(note => (note.tags || []).forEach(tag => counts.set(tag, (counts.get(tag) || 0) + 1)))
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  }, [notes])

  const visibleNotes = activeTag ? notes.filter(note => note.tags?.includes(activeTag)) : notes

  const toggleFormTag = (tag) => {
    setForm(current => ({
      ...current,
      tags: current.tags.includes(tag) ? current.tags.filter(t => t !== tag) : [...current.tags, tag],
    }))
  }

  const addCustomTags = () => {
    const extra = customTag.split(',').map(t => t.trim()).filter(Boolean)
    if (extra.length) {
      setForm(current => ({ ...current, tags: [...new Set([...current.tags, ...extra])] }))
    }
    setCustomTag('')
  }

  const openCreateForm = () => {
    setEditingNote(null)
    setForm({ topic: '', content: '', tags: [] })
    setCustomTag('')
    setFormError('')
    setShowForm(true)
  }

  const openEditForm = (note) => {
    setEditingNote(note)
    setForm({ topic: note.topic, content: note.content, tags: note.tags || [] })
    setCustomTag('')
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

    const pending = customTag.split(',').map(t => t.trim()).filter(Boolean)
    const payload = { ...form, tags: [...new Set([...form.tags, ...pending])] }
    try {
      if (editingNote) {
        await apiService.updateUpscNote(editingNote.id, payload)
      } else {
        await apiService.createUpscNote(payload)
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
      <div className="max-w-5xl mx-auto">
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
          <>
          {tagCounts.length > 0 && (
            <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filter by subject">
              {[[null, notes.length], ...tagCounts].map(([tag, count]) => {
                const active = activeTag === tag
                return (
                  <button
                    key={tag || 'all'}
                    type="button"
                    onClick={() => setActiveTag(active && tag ? null : tag)}
                    aria-pressed={active}
                    className={`rounded border px-3 py-1.5 text-sm transition-colors ${
                      active
                        ? 'border-purple-300/60 bg-[#6600CC] text-white shadow-md shadow-purple-700/30'
                        : 'border-white/10 bg-white/5 text-purple-100/85 hover:border-purple-400/50 hover:text-white'
                    }`}
                  >
                    {tag || 'All'} <span className={active ? 'text-purple-200' : 'text-purple-300/60'}>· {count}</span>
                  </button>
                )
              })}
            </div>
          )}
          <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
            {visibleNotes.map(note => {
              const isLong = note.content.length > LONG_NOTE
              const isOpen = openNotes.has(note.id)
              return (
              <article key={note.id} id={`note-${note.id}`} className="glass-card-bright card-hover reveal scroll-mt-28 overflow-hidden">
                <header className="px-5 pt-5 pb-4 sm:px-6 border-b border-white/10 flex justify-between items-start gap-4">
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-white">{note.topic}</h2>
                    <p className="mt-1 text-xs uppercase tracking-wider text-purple-200">
                      <time dateTime={note.dateAdded}>{formatDate(note.dateAdded)}</time> · {readingTime(note.content)}
                    </p>
                    {note.tags?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {note.tags.map(tag => (
                          <button key={tag} type="button" onClick={() => setActiveTag(tag)} className="pill-tag hover:border-purple-300/60 hover:text-white">
                            {tag}
                          </button>
                        ))}
                      </div>
                    )}
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
                <div className="p-5 sm:p-6">
                  <NoteBody content={note.content} clamped={isLong && !isOpen} />
                  {isLong && (
                    <button
                      onClick={() => setOpenNotes(prev => {
                        const next = new Set(prev)
                        next.has(note.id) ? next.delete(note.id) : next.add(note.id)
                        return next
                      })}
                      aria-expanded={isOpen}
                      className="mt-3 text-sm font-medium text-purple-100 underline decoration-purple-300/50 underline-offset-4 hover:text-white"
                    >
                      {isOpen ? 'Show less' : 'Keep reading →'}
                    </button>
                  )}
                </div>
              </article>
              )
            })}
          </div>
          </>
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
              <div>
                <span className="block text-sm font-medium text-purple-100 mb-2">Subjects</span>
                <div className="flex flex-wrap gap-2">
                  {[...new Set([...SUBJECTS, ...form.tags])].map(tag => {
                    const selected = form.tags.includes(tag)
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleFormTag(tag)}
                        aria-pressed={selected}
                        className={`rounded border px-2.5 py-1 text-xs transition-colors ${
                          selected ? 'border-purple-300/60 bg-[#6600CC] text-white' : 'border-gray-700 text-purple-100 hover:border-purple-400'
                        }`}
                      >
                        {selected ? '✓ ' : ''}{tag}
                      </button>
                    )
                  })}
                </div>
                <input
                  type="text"
                  value={customTag}
                  onChange={event => setCustomTag(event.target.value)}
                  onKeyDown={event => {
                    if (event.key === 'Enter' || event.key === ',') {
                      event.preventDefault()
                      addCustomTags()
                    }
                  }}
                  placeholder="Add another tag and press Enter"
                  className="mt-3 w-full px-4 py-2 rounded-md border border-gray-700 bg-gray-900 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
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
