'use client'

import { useState, useEffect } from 'react'
import { apiService } from '../../services/apiService'
import EntryCard from '../../components/EntryCard'
import AddEntryButton from '../../components/AddEntryButton'

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadRestaurants()
  }, [])

  const loadRestaurants = async () => {
    try {
      setLoading(true)
      const data = await apiService.getAllRestaurants()
      setRestaurants(data)
    } catch (err) {
      setError('Failed to load restaurants')
      console.error('Error loading restaurants:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRestaurantAdded = () => {
    loadRestaurants()
  }

  const handleEdit = (restaurant) => {
    console.log('Edit restaurant:', restaurant)
    alert('Edit functionality will be implemented soon!')
  }

  const handleDelete = async (restaurantId) => {
    try {
      await apiService.deleteRestaurant(restaurantId)
      setRestaurants(restaurants.filter(restaurant => restaurant.id !== restaurantId))
    } catch (error) {
      throw error
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🍽️ Restaurants</h1>
          <p className="text-gray-600">My culinary discoveries</p>
        </div>
        <AddEntryButton type="restaurants" onEntryAdded={handleRestaurantAdded} />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-lg text-gray-600">Loading restaurants...</div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-lg text-red-600">{error}</div>
        </div>
      ) : restaurants.length === 0 ? (
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
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
