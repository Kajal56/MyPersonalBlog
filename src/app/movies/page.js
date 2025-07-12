import { readData } from '../../lib/data'
import EntryCard from '../../components/EntryCard'
import AddEntryButton from '../../components/AddEntryButton'

export default function MoviesPage() {
  const movies = readData('movies')

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🎬 Movies</h1>
          <p className="text-gray-600">My movie watchlist and reviews</p>
        </div>
        <AddEntryButton type="movies" />
      </div>

      {movies.length === 0 ? (
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
            />
          ))}
        </div>
      )}
    </div>
  )
}
