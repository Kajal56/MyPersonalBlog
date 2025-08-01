'use client'
import { useState, useEffect } from 'react'
import EntryCard from '../../components/EntryCard'
import AddEntryButton from '../../components/AddEntryButton'
import { apiService } from '../../services/apiService'

export default function MoviesPage() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log('Loading movies...')
        const data = await apiService.getAllMovies()
        console.log('Movies loaded:', data)
        setMovies(data || [])
      } catch (err) {
        console.error('Error fetching movies:', err)
        setError(`Failed to load movies: ${err.message}`)
        setMovies([])
      } finally {
        setLoading(false)
      }
    }

    fetchMovies()
  }, [])

  const handleMovieAdded = () => {
    // Refresh the list when a new movie is added
    const fetchMovies = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await apiService.getAllMovies()
        setMovies(data || [])
      } catch (err) {
        console.error('Error refreshing movies:', err)
        setError(`Failed to refresh movies: ${err.message}`)
        setMovies([])
      } finally {
        setLoading(false)
      }
    }
    fetchMovies()
  }

  const handleEdit = (movie) => {
    // For now, just log - you can implement edit modal later
    console.log('Edit movie:', movie)
    alert('Edit functionality will be implemented soon!')
  }

  const handleDelete = async (movieId) => {
    console.log('handleDelete called with movieId:', movieId)
    try {
      console.log('Calling apiService.deleteMovie')
      await apiService.deleteMovie(movieId)
      console.log('Movie deleted successfully, updating state')
      // Refresh the list after deletion
      setMovies(movies.filter(movie => movie.id !== movieId))
    } catch (error) {
      console.error('Error in handleDelete:', error)
      throw error // Re-throw to be handled by EntryCard
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🎬 Movies</h1>
          <p className="text-gray-600">My movie watchlist and reviews</p>
        </div>
        <AddEntryButton type="movies" onEntryAdded={handleMovieAdded} />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-lg text-gray-600">Loading movies...</div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-lg text-red-600">{error}</div>
        </div>
      ) : movies.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎬</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No movies yet</h3>
          <p className="text-gray-600">Start adding your movie reviews!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {movies.map((movie) => (
            <EntryCard
              key={movie.id}
              type="movies"
              entry={movie}
              fields={[
                { label: 'Rating', value: `${movie.rating}/10`, icon: '⭐' },
                { label: 'What I liked most', value: movie.favoriteAspect },
                { label: 'Date watched', value: new Date(movie.dateWatched).toLocaleDateString() }
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
