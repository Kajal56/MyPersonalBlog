'use client';

import EntryDetail, { formatDate } from '../../../../components/EntryDetail';
import { apiService } from '../../../../services/apiService';

const fetchRestaurant = (slug) => apiService.getRestaurantBySlug(slug);

export default function RestaurantDetailPage() {
  return (
    <EntryDetail
      fetchEntry={fetchRestaurant}
      backHref="/personal/restaurants"
      backLabel="All restaurants"
      notFoundLabel="restaurant"
      config={(restaurant) => ({
        kicker: '🍽️ Restaurant',
        title: restaurant.name,
        subtitle: [restaurant.cuisine, restaurant.location && `📍 ${restaurant.location}`].filter(Boolean).join(' · '),
        meta: [
          { label: 'Rating', value: restaurant.rating, rating: restaurant.rating },
          { label: 'Visited', value: formatDate(restaurant.dateVisited) },
        ],
        body: { label: 'Favourite dish', text: restaurant.favoriteDish },
      })}
    />
  );
}
