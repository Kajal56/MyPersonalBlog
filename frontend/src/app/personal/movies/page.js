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
    <div className="max-w-6xl mx-auto bg-gradient-to-br from-[#0D0012] to-[#220044] min-h-screen p-6">
      <PersonalTabs />
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">🎬 Movies</h1>
          <p className="text-purple-200">My movie watchlist and reviews</p>
        </div>
        {isAdminMode ? (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-purple-800 hover:bg-purple-900 text-white px-6 py-3 font-medium transition-colors flex items-center space-x-2"
          >
            <span>+</span>
            <span>Add Movie</span>
          </button>
        ) : (
          <button
            onClick={() => setShowSuggestModal(true)}
            className="bg-gradient-to-r from-purple-800 to-purple-900 hover:from-purple-900 hover:to-purple-800 text-white px-6 py-3 font-medium transition-colors flex items-center space-x-2"
          >
            <span>💡</span>
            <span>Suggest a Movie</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-lg text-purple-300">Loading movies...</div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-lg text-red-400">{error}</div>
        </div>
      ) : movies.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎬</div>
          <h3 className="text-xl font-semibold text-white mb-2">No movies yet</h3>
          <p className="text-purple-200">Start adding your movie reviews!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 max-w-2xl mx-auto">
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
          <h2 className="text-2xl font-bold mb-4 text-purple-300">Movie Suggestions</h2>
          {loadingSuggestions ? (
            <div className="text-purple-300">Loading suggestions...</div>
          ) : suggestions.length === 0 ? (
            <div className="text-purple-300">No suggestions yet.</div>
          ) : (
            <div className="space-y-4">
              {suggestions.map(suggestion => (
                <div key={suggestion.id} className="bg-purple-950 bg-opacity-50 p-4 shadow">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-white text-lg mb-1">{suggestion.itemName || 'Untitled'}</div>
                      <div className="text-purple-200 text-base mb-1">{suggestion.message}</div>
                      <div className="text-xs text-purple-300 mt-1">Suggested by: <span className="font-semibold text-white">{suggestion.name || 'Anonymous'}</span> | <span className="text-purple-400">{new Date(suggestion.dateSuggested).toLocaleString()}</span></div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`px-2 py-1 text-xs font-semibold mb-2 ${suggestion.isRead ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>
                        {suggestion.isRead ? 'Read' : 'Unread'}
                      </span>
                      {!suggestion.isRead && (
                        <button
                          className="bg-purple-800 hover:bg-purple-900 text-white text-xs px-3 py-1 transition-colors"
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
