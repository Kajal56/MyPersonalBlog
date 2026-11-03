'use client';
import { useState } from 'react';
import Link from 'next/link';
import ConfirmDialog from './ConfirmDialog';
import { useAdminMode } from './AdminModeContext';

// Compact preview of a review (movie, book, restaurant). Full text lives on the detail page.
export default function ReviewTile({ href, title, subtitle, rating, excerpt, meta, tags = [], onEdit, onDelete }) {
  const { isAdminMode } = useAdminMode();
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <article className="glass-card card-hover reveal group flex h-full flex-col p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-xl font-semibold leading-snug text-white">
            {/* Stretched link: the whole tile is clickable, admin buttons sit above it */}
            <Link href={href} className="after:absolute after:inset-0 after:content-[''] focus:outline-none focus-visible:underline">
              {title}
            </Link>
          </h3>
          {subtitle && <p className="mt-1 text-sm text-purple-200/80">{subtitle}</p>}
        </div>
        {rating !== undefined && rating !== null && (
          <div className="shrink-0 rounded-md border border-yellow-300/30 bg-yellow-300/10 px-2.5 py-1 text-center" aria-label={`Rated ${rating} out of 10`}>
            <span className="font-display text-xl font-semibold text-yellow-200">{rating}</span>
            <span className="text-[10px] text-yellow-200/70">/10</span>
          </div>
        )}
      </div>

      {excerpt && <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-purple-50/90">{excerpt}</p>}

      <div className="mt-auto">
        {tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {tags.slice(0, 3).map((tag) => <span key={tag} className="pill-tag">{tag}</span>)}
            {tags.length > 3 && <span className="pill-tag">+{tags.length - 3}</span>}
          </div>
        )}
        <div className="flex items-center justify-between border-t border-white/10 pt-3 text-xs text-purple-300/80">
          <span>{meta}</span>
          <span className="font-medium text-purple-200 transition-transform duration-300 group-hover:translate-x-1">Read more →</span>
        </div>
      </div>

      {isAdminMode && (onEdit || onDelete) && (
        <div className="relative z-10 mt-3 flex gap-2">
          {onEdit && (
            <button onClick={onEdit} className="rounded bg-purple-950/70 px-2 py-1 text-xs text-purple-200 hover:text-white">Edit</button>
          )}
          {onDelete && (
            <button onClick={() => setConfirmDelete(true)} className="rounded bg-red-950/70 px-2 py-1 text-xs text-red-200 hover:text-white">Delete</button>
          )}
        </div>
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
