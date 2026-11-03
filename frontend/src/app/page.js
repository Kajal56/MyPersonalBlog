'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { TYPE_META, useLatestByType } from '../components/useLatest'
import { timeAgo } from '../utils/text'

const roles = ['Engineer', 'Dancer', 'Dreamer', 'Reader', 'Traveller']

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function Home() {
  const latest = useLatestByType()
  const [roleIndex, setRoleIndex] = useState(0)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const paintingRef = useRef(null)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const id = setInterval(() => setRoleIndex(i => (i + 1) % roles.length), 2200)
    return () => clearInterval(id)
  }, [])

  const handlePaintingMove = (e) => {
    if (prefersReducedMotion() || !paintingRef.current) return
    const rect = paintingRef.current.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ x: py * -8, y: px * 8 })
  }

  return (
    <div className="w-full max-w-screen-xl mx-auto px-2 sm:px-4 md:px-8" style={{paddingBottom: 'env(safe-area-inset-bottom)'}}>
      <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16 py-4 md:py-10 md:min-h-[min(75vh,760px)]">
        <div className="relative flex justify-center animate-fade-up">
          {/* Soft glow behind the painting */}
          <div aria-hidden="true" className="absolute inset-8 rounded-lg bg-accent/25 blur-3xl" />
          <div
            ref={paintingRef}
            onMouseMove={handlePaintingMove}
            onMouseLeave={() => setTilt({ x: 0, y: 0 })}
            className="relative"
            style={{ perspective: '1000px' }}
          >
            <div
              className="relative rounded-lg border border-line bg-surface p-2 shadow-xl shadow-black/10 sm:p-3 transition-transform duration-300 ease-out"
              style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`, transformStyle: 'preserve-3d' }}
            >
              <img
                src="/images/dancing_girl.webp"
                alt="Painting of a Kathak dancer in a yellow outfit"
                className="block w-full max-w-[300px] sm:max-w-[380px] lg:max-w-[440px] h-auto rounded object-contain"
                style={{ maxHeight: '72vh' }}
              />
              {/* Light sheen that shifts with the tilt */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-lg transition-opacity duration-300"
                style={{
                  background: `linear-gradient(${105 + tilt.y * 6}deg, transparent 35%, rgba(255,255,255,0.14) 50%, transparent 65%)`,
                  opacity: tilt.x || tilt.y ? 1 : 0,
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-xl flex flex-col items-center md:items-start text-center md:text-left">
          <p className="animate-fade-up mb-4 inline-flex items-center gap-2 rounded border border-line bg-accent-soft px-4 py-1 text-xs font-medium uppercase tracking-[0.2em] text-accent-ink" style={{ '--i': 1 }}>
            <span aria-hidden="true" className="text-accent-ink">✦</span>
            <span key={roleIndex} aria-hidden="true" className="animate-word inline-block min-w-[6.5rem] text-left">{roles[roleIndex]}</span>
            <span className="sr-only">Engineer, dancer, dreamer, reader, traveller</span>
          </p>
          <h1 className="animate-fade-up font-display text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight text-ink mb-6" style={{ '--i': 2 }}>
            Hi, I&apos;m <span className="italic text-shine">Kajal</span>.
            <span className="block text-2xl sm:text-3xl lg:text-4xl mt-2 text-muted">Welcome to my little corner of the internet.</span>
          </h1>
          <p className="animate-fade-up text-base sm:text-lg text-muted leading-relaxed mb-8" style={{ '--i': 3 }}>
            I&apos;m sharing my personal interests and professional journey here — feel free to explore,
            share your suggestions, interact, or just enjoy the site!
          </p>
          <div className="animate-fade-up flex flex-wrap justify-center md:justify-start gap-3" style={{ '--i': 4 }}>
            <Link href="/personal/feed" className="btn-primary">
              Read my thoughts <span aria-hidden="true">→</span>
            </Link>
            <Link href="/about" className="btn-ghost">
              About me
            </Link>
          </div>
        </div>
      </div>
      {/* Latest from each section */}
      {(latest === null || latest.length > 0) && (
        <section aria-labelledby="latest-heading" className="mt-8 md:mt-4 pb-12">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent-ink">What&apos;s new</p>
              <h2 id="latest-heading" className="font-display text-3xl font-semibold text-ink">Latest from me</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {latest === null
              ? [0, 1, 2].map(i => <div key={i} className="h-44 animate-pulse rounded-lg border border-line bg-sunken" />)
              : latest.map((entry, i) => {
                  const meta = TYPE_META[entry.type]
                  return (
                    <Link
                      key={`${entry.type}-${entry.id}`}
                      href={meta.href(entry)}
                      className={`card card-hover reveal group flex flex-col p-5 sm:p-6 ${i === 0 ? 'sm:col-span-2' : ''}`}
                    >
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-ink">
                          {meta.emoji} {meta.label}
                        </span>
                        {entry.rating != null && (
                          <span className="rounded border border-line bg-accent-soft px-2 py-0.5 text-xs font-semibold text-accent-ink">
                            ★ {entry.rating}/10
                          </span>
                        )}
                      </div>
                      <h3 className={`font-display font-semibold leading-snug text-ink ${i === 0 ? 'text-3xl' : 'text-xl'}`}>{entry.title}</h3>
                      {entry.excerpt && (
                        <p className={`mt-2 text-sm leading-relaxed text-ink/80 ${i === 0 ? 'line-clamp-3' : 'line-clamp-2'}`}>{entry.excerpt}</p>
                      )}
                      <div className="mt-auto flex items-center justify-between pt-4 text-xs text-faint">
                        <span>{timeAgo(entry.dateAdded)}</span>
                        <span className="font-medium text-accent-ink transition-transform duration-300 group-hover:translate-x-1">Read →</span>
                      </div>
                    </Link>
                  )
                })}
          </div>
        </section>
      )}
    </div>
  )
}
