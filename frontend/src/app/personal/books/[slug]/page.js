'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiService } from '../../../../services/apiService';

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        const result = await apiService.getBookBySlug(params.slug);
        setBook(result);
      } catch (err) {
        console.error('Error fetching book:', err);
        setError('Failed to load book');
      } finally {
        setLoading(false);
      }
    };

    if (params.slug) {
      fetchBook();
    }
  }, [params.slug]);

  const handleClose = () => {
    router.push('/personal/books');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#000008] to-[#110033] flex items-center justify-center">
        <div className="text-lg text-purple-200">Loading book...</div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#000008] to-[#110033] flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-red-300 mb-4">{error || 'Book not found'}</div>
          <button
            onClick={handleClose}
            className="bg-purple-950 text-white px-4 py-2 hover:bg-purple-900 transition-colors"
          >
            Back to Books
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#000008] to-[#110033] p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header with back button */}
        <div className="mb-6">
          <button
            onClick={handleClose}
            className="flex items-center text-purple-200 hover:text-white transition-colors mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Books
          </button>
          <h1 className="text-3xl font-bold text-white">{book.title}</h1>
          <p className="text-xl text-purple-200 mt-2">by {book.author}</p>
        </div>

        {/* Book details card */}
        <div className="p-6">
          <div className="grid gap-6">
            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">Rating</label>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${
                      i < book.rating ? 'text-yellow-400' : 'text-gray-600'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="ml-2 text-purple-200">({book.rating}/5)</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">Key Takeaway</label>
              <p className="text-white whitespace-pre-line">{book.keyTakeaway}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">Date Read</label>
              <p className="text-white">{new Date(book.dateRead).toLocaleDateString()}</p>
            </div>

            {book.tags && book.tags.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {book.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-purple-800 text-purple-100 px-3 py-1 text-sm border border-purple-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-purple-200 mb-2">Added</label>
              <p className="text-purple-300 text-sm">{new Date(book.dateAdded).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
