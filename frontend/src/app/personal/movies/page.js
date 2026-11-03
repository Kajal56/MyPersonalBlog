'use client'

import { useState, useEffect } from 'react'
import ReviewTile, { reviewListLayout } from '../../../components/ReviewTile'
import { excerpt } from '../../../utils/text'
import AddEntryButton from '../../../components/AddEntryButton'
import AddEntryModal from '../../../components/AddEntryModal'
import SuggestionModal from '../../../components/SuggestionModal'
import { apiService } from '../../../services/apiService'
import { useAdminMode } from '../../../components/AdminModeContext'

export default function MoviesPage() {
  const [movies, setMovies] = useState([])
  const layout = reviewListLayout(movies.length)
  const { isAdminMode } = useAdminMode()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editMovie, setEditMovie] = useState(null)
  const [showSuggestModal, setShowSuggestModal] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

    const loadMovies = async () => {
    try {
      setLoading(true)
      const data = await apiService.getAllMovies()
      setMovies(data)
    } catch (err) {
      setError('Failed to load movies')
    } finally {
      setLoading(false)
    }
  }

  const loadSuggestions = async () => {
    try {
      setLoadingSuggestions(true)
      const data = await apiService.getSuggestions('movies')
      setSuggestions(data)
    } catch (err) {
      // Optionally handle error
    } finally {
      setLoadingSuggestions(false)
    }
  }

  useEffect(() => {
    loadMovies()
    if (isAdminMode) {
      loadSuggestions()
    }
  }, [isAdminMode])

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
    loadMovies()
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
      <div className="max-w-5xl mx-auto flex flex-wrap gap-4 justify-between items-center mb-8">
        <div>
          <h1 className="page-title mb-2">🎬 Movies</h1>
          <p className="text-muted">My movie watchlist and reviews</p>
        </div>
        {isAdminMode ? (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-accent-soft hover:bg-sunken text-ink px-6 py-3 font-medium transition-colors flex items-center space-x-2"
          >
            <span>+</span>
            <span>Add Movie</span>
          </button>
        ) : (
          <button
            onClick={() => setShowSuggestModal(true)}
            className="btn-primary"
          >
            <span>💡</span>
            <span>Suggest a Movie</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-lg text-accent-ink">Loading movies...</div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-lg text-danger">{error}</div>
        </div>
      ) : movies.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎬</div>
          <h3 className="text-xl font-semibold text-ink mb-2">No movies yet</h3>
          <p className="text-muted">Start adding your movie reviews!</p>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto">
          <div className={layout.gridClassName}>
            {movies.map((movie) => (
              <ReviewTile
                key={movie.id}
                href={`/personal/movies/${movie.slug}`}
                title={movie.title}
                rating={movie.rating}
                excerpt={excerpt(movie.favoriteAspect)}
                tags={movie.tags}
                wide={layout.wide}
                onEdit={isAdminMode ? () => handleEdit(movie) : undefined}
                onDelete={isAdminMode ? () => handleDelete(movie.id) : undefined}
              />
            ))}
          </div>
        </div>
      )}

      {(isAdminMode && (showAddModal || editMovie)) && (
        <AddEntryModal
          type="movies"
          editEntry={editMovie}
          onClose={handleCloseModal}
          onEntryAdded={handleMovieAdded}
        />
      )}
      {(!isAdminMode && showSuggestModal) && (
        <SuggestionModal
          type="movies"
          onClose={() => setShowSuggestModal(false)}
          onSuggestionAdded={loadSuggestions}
        />
      )}

      {/* Suggestions list for admins */}
      {isAdminMode && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4 text-accent-ink">Movie Suggestions</h2>
          {loadingSuggestions ? (
            <div className="text-accent-ink">Loading suggestions...</div>
          ) : suggestions.length === 0 ? (
            <div className="text-accent-ink">No suggestions yet.</div>
          ) : (
            <div className="space-y-4">
              {suggestions.map(suggestion => (
                <div key={suggestion.id} className="bg-accent-soft bg-opacity-50 p-4 shadow">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-ink text-lg mb-1">{suggestion.itemName || 'Untitled'}</div>
                      <div className="text-muted text-base mb-1">{suggestion.message}</div>
                      <div className="text-xs text-accent-ink mt-1">Suggested by: <span className="font-semibold text-ink">{suggestion.name || 'Anonymous'}</span> | <span className="text-accent-ink">{new Date(suggestion.dateSuggested).toLocaleString()}</span></div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`px-2 py-1 text-xs font-semibold mb-2 ${suggestion.isRead ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-accent-ink'}`}>
                        {suggestion.isRead ? 'Read' : 'Unread'}
                      </span>
                      {!suggestion.isRead && (
                        <button
                          className="bg-accent-soft hover:bg-sunken text-ink text-xs px-3 py-1 transition-colors"
                          onClick={async () => {
                            await apiService.updateSuggestion('movies', suggestion.id, { isRead: true })
                            loadSuggestions()
                          }}
                        >
                          Mark as Read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
