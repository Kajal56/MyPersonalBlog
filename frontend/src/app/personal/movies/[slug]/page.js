'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function MovieDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true);
        const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/movies/slug/${params.slug}`;
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.success) {
          setMovie(result.data);
        } else {
          setError('Movie not found');
        }
      } catch (err) {
        console.error('Error fetching movie:', err);
        setError('Failed to load movie');
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      fetchMovie();
    }
  }, [params.slug]);

  const handleClose = () => {
    router.push('/personal/movies');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2D0036] to-[#6600CC] flex items-center justify-center">
        <div className="text-lg text-purple-200">Loading movie...</div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#2D0036] to-[#6600CC] flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-red-300 mb-4">{error || 'Movie not found'}</div>
          <button
            onClick={handleClose}
            className="bg-purple-800 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Back to Personal Movies
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
            Back to Personal Movies
          </button>
          <h1 className="text-3xl font-bold text-white">{movie.title}</h1>
        </div>

        {/* Movie details card */}
        <div className="bg-gradient-to-br from-purple-900/80 to-purple-800/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-purple-700">
          <div className="grid gap-6">
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">Rating</label>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${
                      i < movie.rating ? 'text-yellow-400' : 'text-gray-500'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="ml-2 text-purple-200">({movie.rating}/5)</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">Favorite Aspect</label>
              <p className="text-white bg-purple-800/50 p-3 rounded-lg border border-purple-600">{movie.favoriteAspect}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">Date Watched</label>
              <p className="text-white">{new Date(movie.dateWatched).toLocaleDateString()}</p>
            </div>

            {movie.tags && movie.tags.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {movie.tags.map((tag, index) => (
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
              <p className="text-purple-300 text-sm">{new Date(movie.dateAdded).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
