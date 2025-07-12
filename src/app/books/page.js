import { readData } from '../../lib/data'
import EntryCard from '../../components/EntryCard'
import AddEntryButton from '../../components/AddEntryButton'

export default function BooksPage() {
  const books = readData('books')

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📚 Books</h1>
          <p className="text-gray-600">My reading list and key takeaways</p>
        </div>
        <AddEntryButton type="books" />
      </div>

      {books.length === 0 ? (
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
            />
          ))}
        </div>
      )}
    </div>
  )
}
