'use client';

import EntryDetail, { formatDate } from '../../../../components/EntryDetail';
import { apiService } from '../../../../services/apiService';

const fetchMovie = (slug) => apiService.getMovieBySlug(slug);

export default function MovieDetailPage() {
  return (
    <EntryDetail
      fetchEntry={fetchMovie}
      backHref="/personal/movies"
      backLabel="All movies"
      notFoundLabel="movie"
      config={(movie) => ({
        kicker: '🎬 Movie',
        title: movie.title,
        meta: [
          { label: 'Rating', value: movie.rating, rating: movie.rating },
          { label: 'Watched', value: formatDate(movie.dateWatched) },
        ],
        body: { label: 'What I liked most', text: movie.favoriteAspect },
      })}
    />
  );
}
