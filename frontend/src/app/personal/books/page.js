
'use client'
import { useState, useEffect } from 'react'
import { apiService } from '../../../services/apiService'
import EntryCard from '../../../components/EntryCard'
import AddEntryModal from '../../../components/AddEntryModal'

export default function BooksPage() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editBook, setEditBook] = useState(null)

  useEffect(() => {
    loadBooks()
  }, [])

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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📚 Books</h1>
          <p className="text-gray-600">My reading list and key takeaways</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <span>+</span>
          <span>Add Book</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-lg text-gray-600">Loading books...</div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-lg text-red-600">{error}</div>
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No books yet</h3>
          <p className="text-gray-600">Start adding your book reviews!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <EntryCard
              key={book.id}
              type="books"
              entry={book}
              fields={[
                { label: 'Author', value: book.author, icon: '✍️' },
                { label: 'Rating', value: `${book.rating}/10`, icon: '⭐' },
                { label: 'Key takeaway', value: book.keyTakeaway },
                { label: 'Date read', value: new Date(book.dateRead).toLocaleDateString() }
              ]}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {(showAddModal || editBook) && (
        <AddEntryModal
          type="books"
          editEntry={editBook}
          onClose={handleCloseModal}
          onEntryAdded={handleBookAdded}
        />
      )}
    </div>
  )
}
