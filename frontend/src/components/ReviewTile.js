'use client';
import { useState } from 'react';
import Link from 'next/link';
import ConfirmDialog from './ConfirmDialog';
import CoverArt from './CoverArt';
import { useAdminMode } from './AdminModeContext';

// Short lists get larger horizontal cards; longer ones switch to a 3-column grid
const WIDE_LIST_MAX = 4;

export function reviewListLayout(count) {
  const wide = count <= WIDE_LIST_MAX;
  return {
    wide,
    gridClassName: wide
      ? 'grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8'
      : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8',
  };
}

// Compact preview of a review (movie, book, restaurant). Full text lives on the detail page.
// `wide`: larger horizontal card for short lists. `cover`: image URL, null for a title card,
// undefined while loading; leave out `withCover` for entries that have no artwork.
export default function ReviewTile({ href, title, subtitle, rating, excerpt, tags = [], cover, withCover = false, wide = false, onEdit, onDelete }) {
  const { isAdminMode } = useAdminMode();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const heading = (
    <div className="flex items-start justify-between gap-4">
      <h3 className={`min-w-0 font-display font-semibold leading-snug text-ink ${wide ? 'text-2xl' : 'text-xl'}`}>
        {/* Stretched link: the whole tile is clickable, admin buttons sit above it */}
        <Link href={href} className="after:absolute after:inset-0 after:content-[''] focus:outline-none focus-visible:underline">
          {title}
        </Link>
      </h3>
      {rating !== undefined && rating !== null && (
        <span className="mt-1 shrink-0 text-sm font-semibold text-accent-ink" aria-label={`Rated ${rating} out of 10`}>
          ★ {rating}<span className="font-normal text-faint">/10</span>
        </span>
      )}
    </div>
  );

  const body = (
    <>
      {excerpt && (
        <p className={`mt-4 text-sm leading-relaxed text-muted ${wide ? 'line-clamp-4' : 'line-clamp-3'}`}>{excerpt}</p>
      )}

      {/* Tags and "Read more" share the bottom line; tags never wrap */}
      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
        <div className="flex min-w-0 gap-1.5 overflow-hidden">
          {tags.slice(0, 2).map((tag) => <span key={tag} className="pill-tag max-w-[9rem] truncate">{tag}</span>)}
          {tags.length > 2 && <span className="pill-tag shrink-0">+{tags.length - 2}</span>}
        </div>
        <span className="shrink-0 whitespace-nowrap text-xs font-medium text-accent-ink pointer-events-none transition-transform duration-300 group-hover:translate-x-1">Read more →</span>
      </div>

      {isAdminMode && (onEdit || onDelete) && (
        <div className="relative z-10 mt-3 flex gap-2">
          {onEdit && (
            <button onClick={onEdit} className="rounded bg-accent-soft px-2 py-1 text-xs text-muted hover:text-ink">Edit</button>
          )}
          {onDelete && (
            <button onClick={() => setConfirmDelete(true)} className="rounded bg-danger-soft px-2 py-1 text-xs text-danger hover:text-ink">Delete</button>
          )}
        </div>
      )}
    </>
  );

  return (
    <article className={`card card-hover reveal group flex h-full p-6 ${wide ? 'gap-6 sm:p-7' : 'flex-col'}`}>
      {wide ? (
        <>
          {withCover && <CoverArt src={cover} title={title} className="w-24 self-start sm:w-32" />}
          <div className="flex min-w-0 flex-1 flex-col">
            {heading}
            {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
            {body}
          </div>
        </>
      ) : (
        <>
          <div className="flex gap-4">
            {withCover && <CoverArt src={cover} title={title} className="w-16" />}
            <div className="min-w-0 flex-1">
              {heading}
              {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
            </div>
          </div>
          {body}
        </>
      )}

      <ConfirmDialog
        isOpen={confirmDelete}
        onConfirm={() => { setConfirmDelete(false); onDelete?.(); }}
        onCancel={() => setConfirmDelete(false)}
        title="Delete Entry"
        message={`Are you sure you want to delete "${title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </article>
  );
}
