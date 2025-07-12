import { readData } from '../../lib/data'
import EntryCard from '../../components/EntryCard'
import AddEntryButton from '../../components/AddEntryButton'

export default function RestaurantsPage() {
  const restaurants = readData('restaurants')

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🍽️ Restaurants</h1>
          <p className="text-gray-600">My culinary discoveries</p>
        </div>
        <AddEntryButton type="restaurants" />
      </div>

      {restaurants.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🍽️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No restaurants yet</h3>
          <p className="text-gray-600">Start documenting your dining experiences!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant) => (
            <EntryCard
              key={restaurant.id}
              type="restaurants"
              entry={restaurant}
              fields={[
                { label: 'Location', value: restaurant.location, icon: '📍' },
                { label: 'Cuisine', value: restaurant.cuisine, icon: '🍴' },
                { label: 'Rating', value: `${restaurant.rating}/10`, icon: '⭐' },
                { label: 'Favorite dish', value: restaurant.favoriteDish },
                { label: 'Date visited', value: new Date(restaurant.dateVisited).toLocaleDateString() }
              ]}
            />
          ))}
        </div>
      )}
    </div>
  )
}
