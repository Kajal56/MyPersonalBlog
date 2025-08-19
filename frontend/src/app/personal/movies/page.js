'use client'

import { useState, useEffect } from 'react'
import EntryCard from '../../../components/EntryCard'
import PersonalTabs from '../../../components/PersonalTabs'
import AddEntryButton from '../../../components/AddEntryButton'
import AddEntryModal from '../../../components/AddEntryModal'
import SuggestionModal from '../../../components/SuggestionModal'
import { apiService } from '../../../services/apiService'
import { useAdminMode } from '../../../components/AdminModeContext'

export default function MoviesPage() {
  const [movies, setMovies] = useState([])
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
      <PersonalTabs />
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">🎬 Movies</h1>
          <p className="text-gray-600 dark:text-gray-300">My movie watchlist and reviews</p>
        </div>
        {isAdminMode ? (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#6600CC] hover:bg-[#7D2AE8] text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <span>+</span>
            <span>Add Movie</span>
          </button>
        ) : (
          <button
            onClick={() => setShowSuggestModal(true)}
            className="bg-gradient-to-r from-[#7D2AE8] to-[#6600CC] hover:from-[#6600CC] hover:to-[#7D2AE8] text-white px-6 py-3 font-medium transition-colors flex items-center space-x-2"
          >
            <span>💡</span>
            <span>Suggest a Movie</span>
          </button>
        )}
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
              onEdit={isAdminMode ? handleEdit : undefined}
              onDelete={isAdminMode ? handleDelete : undefined}
              isAdminMode={isAdminMode}
            />
          ))}
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
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Movie Suggestions</h2>
          {loadingSuggestions ? (
            <div className="text-gray-600 dark:text-gray-300">Loading suggestions...</div>
          ) : suggestions.length === 0 ? (
            <div className="text-gray-600 dark:text-gray-300">No suggestions yet.</div>
          ) : (
            <div className="space-y-4">
              {suggestions.map(suggestion => (
                <div key={suggestion.id} className="bg-transparent p-4 rounded-lg shadow">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">{suggestion.itemName || 'Untitled'}</div>
                      <div className="text-gray-700 dark:text-gray-300 text-sm">{suggestion.message}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Suggested by: {suggestion.name || 'Anonymous'} | {new Date(suggestion.dateSuggested).toLocaleString()}</div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`px-2 py-1 rounded text-xs font-semibold mb-2 ${suggestion.isRead ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                        {suggestion.isRead ? 'Read' : 'Unread'}
                      </span>
                      {!suggestion.isRead && (
                        <button
                          className="bg-[#6600CC] hover:bg-[#7D2AE8] text-white text-xs px-3 py-1 rounded transition-colors"
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
