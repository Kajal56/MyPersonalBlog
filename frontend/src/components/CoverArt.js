'use client';
import { useState } from 'react';

// A 2:3 cover image (book cover / movie poster). Without an image, or if it
// fails to load, shows the title's initial on an accent-coloured card instead.
// `src` undefined = still looking up, null = no cover.
export default function CoverArt({ src, title, className = '' }) {
  const [failed, setFailed] = useState(false);
  const showImage = src && !failed;

  return (
    <div className={`relative aspect-[2/3] shrink-0 overflow-hidden rounded-md border border-line bg-sunken shadow-md shadow-black/20 ${className}`}>
      {showImage ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : src === undefined && !failed ? (
        <div className="h-full w-full animate-pulse bg-sunken" />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center"
          style={{ containerType: 'inline-size', backgroundImage: 'linear-gradient(150deg, rgb(var(--accent-2) / 0.55), rgb(var(--accent) / 0.85))' }}
        >
          {/* A big initial reads at any size, unlike a squeezed title */}
          <span aria-hidden="true" className="font-display font-semibold italic leading-none text-on-accent/90" style={{ fontSize: 'min(3.5rem, 45cqw)' }}>
            {(title || '?').trim().charAt(0).toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
}
