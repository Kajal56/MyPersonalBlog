
'use client'
import { useState, useEffect } from 'react'
import { apiService } from '../../../services/apiService'
import Link from 'next/link'
import ConfirmDialog from '../../../components/ConfirmDialog'
import { excerpt, formatDate } from '../../../utils/text'
import AddEntryModal from '../../../components/AddEntryModal'
import { useAdminMode } from '../../../components/AdminModeContext'
import SuggestionModal from '../../../components/SuggestionModal'

const tripLength = (start, end) => {
  if (!start || !end) return null
  const days = Math.round((new Date(end) - new Date(start)) / 86400000) + 1
  return days > 0 ? `${days} day${days === 1 ? '' : 's'}` : null
}

function TripTimelineItem({ trip, onEdit, onDelete }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const length = tripLength(trip.startDate, trip.endDate)

  return (
    <li className="reveal relative mb-10 pl-8 sm:pl-10 last:mb-0">
      {/* Dot on the timeline */}
      <span aria-hidden="true" className="absolute -left-[7px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-[#0a0011] bg-gradient-to-br from-fuchsia-400 to-[#7D2AE8] shadow-[0_0_12px_rgba(167,139,250,0.8)]" />
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-purple-300">
        {formatDate(trip.startDate, { month: 'long', year: 'numeric' })}
      </p>
      <article className="glass-card card-hover group p-5 sm:p-6">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 className="font-display text-2xl font-semibold text-white">
            <Link href={`/personal/trips/${trip.slug}`} className="after:absolute after:inset-0 after:content-[''] focus:outline-none focus-visible:underline">
              {trip.title}
            </Link>
          </h3>
          {length && <span className="text-xs uppercase tracking-wider text-purple-300/80">{length}</span>}
        </div>
        {trip.destination && <p className="mb-3 text-sm text-purple-200">📍 {trip.destination}</p>}
        {trip.highlight && <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-purple-50/90">{excerpt(trip.highlight, 260)}</p>}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {(trip.tags || []).map(tag => <span key={tag} className="pill-tag">{tag}</span>)}
          </div>
          <span className="text-xs font-medium text-purple-200 transition-transform duration-300 group-hover:translate-x-1">Read the story →</span>
        </div>
        {(onEdit || onDelete) && (
          <div className="relative z-10 mt-4 flex gap-2">
            {onEdit && <button onClick={onEdit} className="rounded bg-purple-950/70 px-2 py-1 text-xs text-purple-200 hover:text-white">Edit</button>}
            {onDelete && <button onClick={() => setConfirmDelete(true)} className="rounded bg-red-950/70 px-2 py-1 text-xs text-red-200 hover:text-white">Delete</button>}
          </div>
        )}
      </article>
      <ConfirmDialog
        isOpen={confirmDelete}
        onConfirm={() => { setConfirmDelete(false); onDelete?.() }}
        onCancel={() => setConfirmDelete(false)}
        title="Delete Trip"
        message={`Are you sure you want to delete "${trip.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </li>
  )
}

export default function TripsPage() {
  const { isAdminMode } = useAdminMode()
  const [trips, setTrips] = useState([])
  // Timeline runs by when the trip happened, newest first
  const tripsByDate = [...trips].sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editTrip, setEditTrip] = useState(null)
  const [showSuggestModal, setShowSuggestModal] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

  useEffect(() => {
    loadTrips()
    if (isAdminMode) {
      loadSuggestions()
    }
  }, [isAdminMode])

  const loadTrips = async () => {
    try {
      setLoading(true)
      const data = await apiService.getAllTrips()
      setTrips(data)
    } catch (err) {
      setError('Failed to load trips')
    } finally {
      setLoading(false)
    }
  }

  const loadSuggestions = async () => {
    try {
      setLoadingSuggestions(true)
      const data = await apiService.getSuggestions('trips')
      setSuggestions(data)
    } catch (err) {
      // Optionally handle error
    } finally {
      setLoadingSuggestions(false)
    }
  }

  const handleTripAdded = () => {
    loadTrips()
  }

  const handleEdit = (trip) => {
    setEditTrip(trip)
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    setEditTrip(null)
  }

  const handleDelete = async (tripId) => {
    try {
      await apiService.deleteTrip(tripId)
      setTrips(trips.filter(trip => trip.id !== tripId))
    } catch (error) {
      throw error
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="max-w-3xl mx-auto flex flex-wrap gap-4 justify-between items-center mb-8">
        <div>
          <h1 className="page-title mb-2">✈️ Trips</h1>
          <p className="text-purple-200/80">My travel adventures and memories</p>
        </div>
        {isAdminMode ? (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#6600CC] hover:bg-[#7D2AE8] text-white px-6 py-3 font-medium transition-colors flex items-center space-x-2"
          >
            <span>+</span>
            <span>Add Trip</span>
          </button>
        ) : (
          <button
            onClick={() => setShowSuggestModal(true)}
            className="btn-primary"
          >
            <span>💡</span>
            <span>Suggest a Trip</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-lg text-gray-600 dark:text-gray-300">Loading trips...</div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-lg text-red-600 dark:text-red-400">{error}</div>
        </div>
      ) : trips.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">✈️</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No trips yet</h3>
          <p className="text-gray-600 dark:text-gray-300">Start documenting your travels!</p>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto">
          <ol className="relative border-l border-purple-400/25 ml-3 sm:ml-4">
            {tripsByDate.map((trip) => (
              <TripTimelineItem
                key={trip.id}
                trip={trip}
                onEdit={isAdminMode ? () => handleEdit(trip) : undefined}
                onDelete={isAdminMode ? () => handleDelete(trip.id) : undefined}
              />
            ))}
          </ol>
        </div>
      )}      {/* Suggestion Modal for non-admins */}
      {showSuggestModal && (
        <SuggestionModal
          type="trips"
          onClose={() => setShowSuggestModal(false)}
          onSuggestionAdded={loadSuggestions}
        />
      )}

      {/* Add/Edit Modal for admins */}
      {(isAdminMode && (showAddModal || editTrip)) && (
        <AddEntryModal
          type="trips"
          editEntry={editTrip}
          onClose={handleCloseModal}
          onEntryAdded={handleTripAdded}
        />
      )}

      {/* Suggestions list for admins */}
      {isAdminMode && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4 text-[#7D2AE8] dark:text-[#A78BFA]">Trip Suggestions</h2>          {loadingSuggestions ? (
            <div className="text-gray-600 dark:text-gray-300">Loading suggestions...</div>
          ) : suggestions.length === 0 ? (
            <div className="text-gray-600 dark:text-gray-300">No suggestions yet.</div>
          ) : (
            <div className="space-y-4">
              {suggestions.map(suggestion => (
                <div key={suggestion.id} className="bg-[#181825] p-4 rounded-lg shadow">
                  <div className="flex justify-between items-center">
                    <div>
                        <div className="font-semibold text-white text-lg mb-1">{suggestion.itemName || 'Untitled'}</div>
                        <div className="text-[#A78BFA] text-base mb-1">{suggestion.message}</div>
                        <div className="text-xs text-gray-300 mt-1">Suggested by: <span className="font-semibold text-white">{suggestion.name || 'Anonymous'}</span> | <span className="text-gray-400">{new Date(suggestion.dateSuggested).toLocaleString()}</span></div>                    
                      </div>
                    <div className="flex flex-col items-end">
                      <span className={`px-2 py-1 rounded text-xs font-semibold mb-2 ${suggestion.isRead ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                        {suggestion.isRead ? 'Read' : 'Unread'}
                      </span>
                      {!suggestion.isRead && (
                        <button
                          className="bg-[#6600CC] hover:bg-[#7D2AE8] text-white text-xs px-3 py-1 rounded transition-colors"
                          onClick={async () => {
                            await apiService.updateSuggestion('trips', suggestion.id, { isRead: true })
                            loadSuggestions()
                          }}
                        >
                          Mark as Read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
