import { readData } from '../../lib/data'
import EntryCard from '../../components/EntryCard'
import AddEntryButton from '../../components/AddEntryButton'

export default function TripsPage() {
  const trips = readData('trips')

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">✈️ Trips</h1>
          <p className="text-gray-600">My travel adventures and memories</p>
        </div>
        <AddEntryButton type="trips" />
      </div>

      {trips.length === 0 ? (
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
