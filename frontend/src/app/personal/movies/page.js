
'use client'
import { useState, useEffect } from 'react'
import EntryCard from '../../../components/EntryCard'
import AddEntryButton from '../../../components/AddEntryButton'
import AddEntryModal from '../../../components/AddEntryModal'
import { apiService } from '../../../services/apiService'

export default function MoviesPage() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editMovie, setEditMovie] = useState(null)

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await apiService.getAllMovies()
        setMovies(data || [])
      } catch (err) {
        setError(`Failed to load movies: ${err.message}`)
        setMovies([])
      } finally {
        setLoading(false)
      }
    }
    fetchMovies()
  }, [])

  const handleMovieAdded = () => {
    const fetchMovies = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await apiService.getAllMovies()
        setMovies(data || [])
      } catch (err) {
        setError(`Failed to refresh movies: ${err.message}`)
        setMovies([])
      } finally {
        setLoading(false)
      }
    }
    fetchMovies()
  }

  const handleEdit = (movie) => {
    setEditMovie(movie)
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    setEditMovie(null)
  }

  const handleDelete = async (movieId) => {
    try {
      await apiService.deleteMovie(movieId)
      setMovies(movies.filter(movie => movie.id !== movieId))
    } catch (error) {
      throw error
    }
  }

  return (
  <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">🎬 Movies</h1>
          <p className="text-gray-600 dark:text-gray-300">My movie watchlist and reviews</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <span>+</span>
          <span>Add Movie</span>
        </button>
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

      {(showAddModal || editMovie) && (
        <AddEntryModal
          type="movies"
          editEntry={editMovie}
          onClose={handleCloseModal}
          onEntryAdded={handleMovieAdded}
        />
      )}
    </div>
  )
}
