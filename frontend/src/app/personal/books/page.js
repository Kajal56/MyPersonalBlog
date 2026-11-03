'use client'
import { useState, useEffect } from 'react'
import { apiService } from '../../../services/apiService'
import ReviewTile, { reviewListLayout } from '../../../components/ReviewTile'
import { useBookCover } from '../../../components/useBookCover'
import { excerpt } from '../../../utils/text'
import { useAdminMode } from '../../../components/AdminModeContext'
import AddEntryModal from '../../../components/AddEntryModal'
import SuggestionModal from '../../../components/SuggestionModal'

// Book tile with its cover looked up on Open Library
function BookTile({ author, ...props }) {
  const cover = useBookCover(props.title, author)
  return <ReviewTile {...props} withCover cover={cover} />
}

export default function BooksPage() {
  const { isAdminMode } = useAdminMode()
  const [books, setBooks] = useState([])
  const layout = reviewListLayout(books.length)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editBook, setEditBook] = useState(null)
  const [showSuggestModal, setShowSuggestModal] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

  useEffect(() => {
    loadBooks()
    if (isAdminMode) {
      loadSuggestions()
    }
  }, [isAdminMode])

  const loadBooks = async () => {
    try {
      setLoading(true)
      const data = await apiService.getAllBooks()
      setBooks(data)
    } catch (err) {
      setError('Failed to load books')
    } finally {
      setLoading(false)
    }
  }

  const loadSuggestions = async () => {
    try {
      setLoadingSuggestions(true)
      const data = await apiService.getSuggestions('books')
      setSuggestions(data)
    } catch (err) {
      // Optionally handle error
    } finally {
      setLoadingSuggestions(false)
    }
  }

  const handleBookAdded = () => {
    loadBooks()
  }

  const handleEdit = (book) => {
    setEditBook(book)
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    setEditBook(null)
  }

  const handleDelete = async (bookId) => {
    try {
      await apiService.deleteBook(bookId)
      setBooks(books.filter(book => book.id !== bookId))
    } catch (error) {
      throw error
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex-1">
          <h1 className="page-title mb-2">📚 Books</h1>
          <p className="text-muted text-sm sm:text-base">My reading list and key takeaways</p>
        </div>
        {isAdminMode ? (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-accent hover:bg-accent-hover text-on-accent px-4 sm:px-6 py-2 sm:py-3 font-medium transition-colors flex items-center space-x-2 text-sm sm:text-base rounded-md"
          >
            <span>+</span>
            <span>Add Book</span>
          </button>
        ) : (
          <button
            onClick={() => setShowSuggestModal(true)}
            className="btn-primary text-sm sm:text-base"
          >
            <span>💡</span>
            <span>Suggest a Book</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-lg text-muted">Loading books...</div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-lg text-danger">{error}</div>
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-ink mb-2">No books yet</h3>
          <p className="text-muted">Start adding your book reviews!</p>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto">
          <div className={layout.gridClassName}>
            {books.map((book) => (
              <BookTile
                wide={layout.wide}
                key={book.id}
                href={`/personal/books/${book.slug}`}
                title={book.title}
                subtitle={book.author && `by ${book.author}`}
                rating={book.rating}
                excerpt={excerpt(book.keyTakeaway)}
                tags={book.tags}
                author={book.author}
                onEdit={isAdminMode ? () => handleEdit(book) : undefined}
                onDelete={isAdminMode ? () => handleDelete(book.id) : undefined}
              />
            ))}
          </div>
        </div>
      )}      {/* Suggestion Modal for non-admins */}
      {showSuggestModal && (
        <SuggestionModal
          type="books"
          onClose={() => setShowSuggestModal(false)}
          onSuggestionAdded={loadSuggestions}
        />
      )}

      {/* Add/Edit Modal for admins */}
      {(isAdminMode && (showAddModal || editBook)) && (
        <AddEntryModal
          type="books"
          editEntry={editBook}
          onClose={handleCloseModal}
          onEntryAdded={handleBookAdded}
        />
      )}

      {/* Suggestions list for admins */}
      {isAdminMode && (
        <div className="mt-8 sm:mt-12">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-accent-ink">Book Suggestions</h2>
          {loadingSuggestions ? (
            <div className="text-muted">Loading suggestions...</div>
          ) : suggestions.length === 0 ? (
            <div className="text-muted">No suggestions yet.</div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {suggestions.map(suggestion => (
                <div key={suggestion.id} className="bg-surface p-3 sm:p-4 rounded-lg shadow">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex-1">
                      <div className="font-semibold text-ink text-base sm:text-lg mb-1">{suggestion.itemName || 'Untitled'}</div>
                      <div className="text-accent-ink text-sm sm:text-base mb-1">{suggestion.message}</div>
                      <div className="text-xs text-muted mt-1">
                        Suggested by: <span className="font-semibold text-ink">{suggestion.name || 'Anonymous'}</span> | 
                        <span className="text-muted"> {new Date(suggestion.dateSuggested).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${suggestion.isRead ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                        {suggestion.isRead ? 'Read' : 'Unread'}
                      </span>
                      {!suggestion.isRead && (
                        <button
                          className="bg-accent hover:bg-accent-hover text-on-accent text-xs px-3 py-1 rounded transition-colors whitespace-nowrap"
                          onClick={async () => {
                            await apiService.updateSuggestion('books', suggestion.id, { isRead: true })
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
