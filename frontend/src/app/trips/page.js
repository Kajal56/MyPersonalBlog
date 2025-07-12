'use client'

import { useState, useEffect } from 'react'
import { apiService } from '../../services/apiService'
import EntryCard from '../../components/EntryCard'
import AddEntryButton from '../../components/AddEntryButton'

export default function TripsPage() {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadTrips()
  }, [])

  const loadTrips = async () => {
    try {
      setLoading(true)
      const data = await apiService.getAllTrips()
      setTrips(data)
    } catch (err) {
      setError('Failed to load trips')
      console.error('Error loading trips:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleTripAdded = () => {
    loadTrips()
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">✈️ Trips</h1>
          <p className="text-gray-600">My travel adventures and memories</p>
        </div>
        <AddEntryButton type="trips" onEntryAdded={handleTripAdded} />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-lg text-gray-600">Loading trips...</div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-lg text-red-600">{error}</div>
        </div>
      ) : trips.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">✈️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No trips yet</h3>
          <p className="text-gray-600">Start documenting your travels!</p>
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
            />
          ))}
        </div>
      )}
    </div>
  )
}
