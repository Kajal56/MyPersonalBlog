'use client';

import EntryDetail, { formatDate } from '../../../../components/EntryDetail';
import { apiService } from '../../../../services/apiService';

const fetchTrip = (slug) => apiService.getTripBySlug(slug);

const tripLength = (start, end) => {
  if (!start || !end) return null;
  const days = Math.round((new Date(end) - new Date(start)) / 86400000) + 1;
  return days > 0 ? `${days} day${days === 1 ? '' : 's'}` : null;
};

export default function TripDetailPage() {
  return (
    <EntryDetail
      fetchEntry={fetchTrip}
      backHref="/personal/trips"
      backLabel="All trips"
      notFoundLabel="trip"
      config={(trip) => ({
        kicker: '✈️ Trip',
        title: trip.title,
        subtitle: trip.destination && `📍 ${trip.destination}`,
        meta: [
          { label: 'From', value: formatDate(trip.startDate) },
          { label: 'To', value: formatDate(trip.endDate) },
          { label: 'Length', value: tripLength(trip.startDate, trip.endDate) },
        ],
        body: { label: 'Highlights', text: trip.highlight },
      })}
    />
  );
}
