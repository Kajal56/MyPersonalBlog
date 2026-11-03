'use client';
import { useEffect, useState } from 'react';

const CACHE_PREFIX = 'cover:v1:';
const memory = new Map();

function readCache(key) {
  if (memory.has(key)) return memory.get(key);
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (raw !== null) {
      const value = raw === '' ? null : raw;
      memory.set(key, value);
      return value;
    }
  } catch {}
  return undefined;
}

function writeCache(key, value) {
  memory.set(key, value);
  try { localStorage.setItem(CACHE_PREFIX + key, value || ''); } catch {}
}

// Looks up a book cover on Open Library by title and author.
// Returns undefined while looking, then the cover URL or null if none was found.
export function useBookCover(title, author) {
  const key = title ? `${title}|${author || ''}`.toLowerCase() : null;
  const [cover, setCover] = useState(() => (key ? readCache(key) : null));

  useEffect(() => {
    if (!key) {
      setCover(null);
      return;
    }
    const cached = readCache(key);
    if (cached !== undefined) {
      setCover(cached);
      return;
    }
    let cancelled = false;
    const params = new URLSearchParams({ title, limit: '1', fields: 'cover_i' });
    if (author) params.set('author', author);
    fetch(`https://openlibrary.org/search.json?${params}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const id = data?.docs?.[0]?.cover_i;
        const url = id ? `https://covers.openlibrary.org/b/id/${id}-M.jpg` : null;
        writeCache(key, url);
        if (!cancelled) setCover(url);
      })
      .catch(() => { if (!cancelled) setCover(null); });
    return () => { cancelled = true; };
  }, [key, title, author]);

  return cover;
}
