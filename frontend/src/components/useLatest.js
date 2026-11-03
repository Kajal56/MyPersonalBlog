'use client';
import { useEffect, useState } from 'react';
import { apiService } from '../services/apiService';

// How each type from /api/recent is labelled and where it links
export const TYPE_META = {
  thought: { label: 'Thought', emoji: '💭', href: (e) => `/personal/feed#post-${e.id}` },
  upsc: { label: 'UPSC note', emoji: '📝', href: (e) => `/personal/upsc-notes#note-${e.id}` },
  movie: { label: 'Movie', emoji: '🎬', href: (e) => `/personal/movies/${e.slug}` },
  book: { label: 'Book', emoji: '📚', href: (e) => `/personal/books/${e.slug}` },
  trip: { label: 'Trip', emoji: '✈️', href: (e) => `/personal/trips/${e.slug}` },
};

// Latest entry of each type, newest first. `null` while loading.
export function useLatestByType() {
  const [latest, setLatest] = useState(null);

  useEffect(() => {
    let cancelled = false;
    apiService
      .getRecentEntries(40)
      .then((entries) => {
        const seen = new Set();
        const firstOfEach = (entries || []).filter((e) => TYPE_META[e.type] && !seen.has(e.type) && seen.add(e.type));
        if (!cancelled) setLatest(firstOfEach);
      })
      .catch((err) => {
        console.error('Error loading latest entries:', err);
        if (!cancelled) setLatest([]);
      });
    return () => { cancelled = true; };
  }, []);

  return latest;
}
