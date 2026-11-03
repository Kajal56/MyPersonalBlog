'use client';

import EntryDetail, { formatDate } from '../../../../components/EntryDetail';
import { apiService } from '../../../../services/apiService';

const fetchBook = (slug) => apiService.getBookBySlug(slug);

export default function BookDetailPage() {
  return (
    <EntryDetail
      fetchEntry={fetchBook}
      backHref="/personal/books"
      backLabel="All books"
      notFoundLabel="book"
      config={(book) => ({
        kicker: '📚 Book',
        title: book.title,
        coverLookup: { title: book.title, author: book.author },
        subtitle: book.author && `by ${book.author}`,
        meta: [
          { label: 'Rating', value: book.rating, rating: book.rating },
          { label: 'Read', value: formatDate(book.dateRead) },
        ],
        body: { label: 'Key takeaway', text: book.keyTakeaway },
      })}
    />
  );
}
