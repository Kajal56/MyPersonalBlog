'use client'

import { useState, useEffect } from 'react'
import { apiService } from '../../../services/apiService'
import ReviewTile from '../../../components/ReviewTile'
import { formatDate } from '../../../utils/text'
import AddEntryModal from '../../../components/AddEntryModal'

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editRestaurant, setEditRestaurant] = useState(null)

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
    } finally {
      setLoading(false)
    }
  }

  const handleRestaurantAdded = () => {
    loadRestaurants()
  }

  const handleEdit = (restaurant) => {
    setEditRestaurant(restaurant)
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    setEditRestaurant(null)
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
      <div className="max-w-5xl mx-auto flex flex-wrap gap-4 justify-between items-center mb-8">
        <div>
          <h1 className="page-title mb-2">🍽️ Restaurants</h1>
          <p className="text-purple-200/80">My dining experiences and favorites</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
        >
          <span>+</span>
          <span>Add Restaurant</span>
        </button>
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
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {restaurants.map((restaurant) => (
              <ReviewTile
                key={restaurant.id}
                href={`/personal/restaurants/${restaurant.slug}`}
                title={restaurant.name}
                subtitle={[restaurant.cuisine, restaurant.location && `📍 ${restaurant.location}`].filter(Boolean).join(' · ')}
                rating={restaurant.rating}
                excerpt={restaurant.favoriteDish && `Favourite dish: ${restaurant.favoriteDish}`}
                meta={restaurant.dateVisited ? `Visited ${formatDate(restaurant.dateVisited)}` : null}
                tags={restaurant.tags}
                onEdit={() => handleEdit(restaurant)}
                onDelete={() => handleDelete(restaurant.id)}
              />
            ))}
          </div>
        </div>
      )}

      {(showAddModal || editRestaurant) && (
        <AddEntryModal
          type="restaurants"
          editEntry={editRestaurant}
          onClose={handleCloseModal}
          onEntryAdded={handleRestaurantAdded}
        />
      )}
    </div>
  )
}
