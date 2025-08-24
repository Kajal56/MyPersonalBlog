
'use client'
import { useState, useEffect } from 'react'
import { apiService } from '../../../services/apiService'
import EntryCard from '../../../components/EntryCard'
import AddEntryModal from '../../../components/AddEntryModal'
import PersonalTabs from '../../../components/PersonalTabs'
import { useAdminMode } from '../../../components/AdminModeContext'
import SuggestionModal from '../../../components/SuggestionModal'

export default function TripsPage() {
  const { isAdminMode } = useAdminMode()
  const [trips, setTrips] = useState([])
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
      <PersonalTabs />
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">✈️ Trips</h1>
          <p className="text-white">My travel adventures and memories</p>
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
            className="bg-gradient-to-r from-[#7D2AE8] to-[#6600CC] hover:from-[#6600CC] hover:to-[#7D2AE8] text-white px-6 py-3 font-medium transition-colors flex items-center space-x-2"
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <EntryCard
              key={trip.id}
              type="trips"
              entry={trip}
              fields={[
                { label: 'Destination', value: trip.destination, icon: '📍' },
                { label: 'Duration', value: `${trip.startDate} - ${trip.endDate}` },
                { label: 'Highlight', value: trip.highlight },
              ]}
              onEdit={isAdminMode ? handleEdit : undefined}
              onDelete={isAdminMode ? handleDelete : undefined}
              isAdminMode={isAdminMode}
            />
          ))}
        </div>
      )}

      {/* Suggestion Modal for non-admins */}
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
