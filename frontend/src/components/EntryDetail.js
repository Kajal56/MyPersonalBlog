'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { formatDate, readingTime } from '../utils/text';

export { formatDate };

function RatingMeter({ rating }) {
  const pct = Math.max(0, Math.min(10, rating)) * 10;
  return (
    <div>
      <div className="flex items-baseline gap-1">
        <span className="text-yellow-300" aria-hidden="true">★</span>
        <span className="font-display text-3xl font-semibold text-white">{rating}</span>
        <span className="text-sm text-purple-200/70">/ 10</span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded bg-white/10">
        <div className="h-full rounded bg-gradient-to-r from-[#7D2AE8] to-fuchsia-400" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// Shared layout for movie / book / trip / restaurant detail pages.
// `config` maps the fetched entry to what the page shows.
export default function EntryDetail({ fetchEntry, backHref, backLabel, notFoundLabel, config }) {
  const { slug } = useParams();
  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    fetchEntry(slug)
      .then((data) => { if (!cancelled) setEntry(data); })
      .catch((err) => {
        console.error('Error fetching entry:', err);
        if (!cancelled) setError(`Couldn't load this ${notFoundLabel}.`);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [slug, fetchEntry, notFoundLabel]);

  const backLink = (
    <Link
      href={backHref}
      className="group inline-flex items-center gap-2 text-sm font-medium text-purple-200 transition-colors hover:text-white"
    >
      <span aria-hidden="true" className="transition-transform duration-300 group-hover:-translate-x-1">←</span>
      {backLabel}
    </Link>
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl animate-pulse py-4">
        <div className="mb-8 h-4 w-32 rounded bg-white/10" />
        <div className="mb-3 h-10 w-2/3 rounded bg-white/10" />
        <div className="mb-10 h-5 w-1/3 rounded bg-white/10" />
        <div className="h-64 rounded-lg bg-white/5" />
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div className="mx-auto max-w-3xl py-16 text-center">
        <p className="mb-6 text-lg text-purple-100">{error || `This ${notFoundLabel} doesn't exist (anymore).`}</p>
        {backLink}
      </div>
    );
  }

  const { kicker, title, subtitle, meta = [], body } = config(entry);
  const visibleMeta = meta.filter((m) => m.value !== null && m.value !== undefined && m.value !== '');
  const added = formatDate(entry.dateAdded);

  return (
    <article className="mx-auto max-w-3xl py-2 sm:py-4">
      <div className="mb-8 animate-fade-up">{backLink}</div>

      <header className="mb-8">
        <p className="animate-fade-up mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-purple-300" style={{ '--i': 1 }}>
          {kicker}
        </p>
        <h1 className="animate-fade-up font-display text-4xl font-semibold leading-tight text-white sm:text-5xl" style={{ '--i': 2 }}>
          {title}
        </h1>
        {subtitle && (
          <p className="animate-fade-up mt-3 text-lg text-purple-200/90" style={{ '--i': 3 }}>{subtitle}</p>
        )}
      </header>

      {visibleMeta.length > 0 && (
        <div className={`animate-fade-up mb-6 grid grid-cols-1 gap-3 ${visibleMeta.length >= 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`} style={{ '--i': 4 }}>
          {visibleMeta.map((m) => (
            <div key={m.label} className="glass-card p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-purple-300/90">{m.label}</p>
              {m.rating !== undefined ? (
                <RatingMeter rating={m.rating} />
              ) : (
                <p className="text-base font-medium text-white">{m.value}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {body?.text && (
        <section className="glass-card animate-fade-up p-6 sm:p-8" style={{ '--i': 5 }}>
          <div className="mb-4 flex items-baseline justify-between gap-4">
            <h2 className="font-display text-2xl font-semibold text-white">{body.label}</h2>
            <span className="shrink-0 text-xs uppercase tracking-wider text-purple-300/70">{readingTime(body.text)}</span>
          </div>
          <p className="whitespace-pre-line text-base leading-8 text-purple-50 sm:text-[17px]">{body.text}</p>
        </section>
      )}

      {(entry.tags?.length > 0 || added) && (
        <footer className="animate-fade-up mt-6 flex flex-wrap items-center justify-between gap-4" style={{ '--i': 6 }}>
          <div className="flex flex-wrap gap-2">
            {entry.tags?.map((tag) => (
              <span key={tag} className="pill-tag">{tag}</span>
            ))}
          </div>
          {added && <p className="text-xs uppercase tracking-wider text-purple-300/70">Added {added}</p>}
        </footer>
      )}
    </article>
  );
}
