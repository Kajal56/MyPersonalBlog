'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        setLoading(true);
        const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/trips/slug/${params.slug}`;
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.success) {
          setTrip(result.data);
        } else {
          setError('Trip not found');
        }
      } catch (err) {
        console.error('Error fetching trip:', err);
        setError('Failed to load trip');
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      fetchTrip();
    }
  }, [params.slug]);

  const handleClose = () => {
    router.push('/personal/trips');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2D0036] to-[#6600CC] flex items-center justify-center">
        <div className="text-lg text-purple-200">Loading trip...</div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2D0036] to-[#6600CC] flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-red-300 mb-4">{error || 'Trip not found'}</div>
          <button
            onClick={handleClose}
            className="bg-purple-800 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Back to Personal Trips
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2D0036] to-[#6600CC] p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header with back button */}
        <div className="mb-6">
          <button
            onClick={handleClose}
            className="flex items-center text-purple-200 hover:text-white transition-colors mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Personal Trips
          </button>
          <h1 className="text-3xl font-bold text-white">{trip.title}</h1>
          <p className="text-xl text-purple-200 mt-2">{trip.destination}</p>
        </div>

        {/* Trip details card */}
        <div className="bg-gradient-to-br from-purple-900/80 to-purple-800/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-purple-700">
          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">Start Date</label>
                <p className="text-white">{new Date(trip.startDate).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">End Date</label>
                <p className="text-white">{new Date(trip.endDate).toLocaleDateString()}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">Highlight</label>
              <p className="text-white bg-purple-800/50 p-3 rounded-lg border border-purple-600">{trip.highlight}</p>
            </div>

            {trip.tags && trip.tags.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {trip.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-purple-700 text-purple-100 px-3 py-1 rounded-full text-sm border border-purple-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">Added</label>
              <p className="text-purple-300 text-sm">{new Date(trip.dateAdded).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
