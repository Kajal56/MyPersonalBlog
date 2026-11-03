'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { apiService } from '../services/apiService'

const roles = ['Engineer', 'Dancer', 'Dreamer', 'Reader', 'Traveller']

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export default function Home() {
  const [recentEntries, setRecentEntries] = useState([])
  const [loading, setLoading] = useState(true)
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
    setTilt({ x: py * -12, y: px * 12 })
  }

  useEffect(() => {
    loadRecentEntries()
  }, [])

  const loadRecentEntries = async () => {
    try {
      setLoading(true)
      const data = await apiService.getRecentEntries()
      setRecentEntries(data)
    } catch (err) {
      console.error('Error loading recent entries:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-screen-xl mx-auto px-2 sm:px-4 md:px-8" style={{paddingBottom: 'env(safe-area-inset-bottom)'}}>
      <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16 py-4 md:py-10 md:min-h-[75vh]">
        <div className="relative flex justify-center animate-fade-up">
          {/* Glow behind the painting */}
          <div aria-hidden="true" className="absolute inset-6 rounded-lg bg-gradient-to-br from-amber-400/30 via-[#7D2AE8]/40 to-[#6600CC]/50 blur-3xl" />
          <div
            ref={paintingRef}
            onMouseMove={handlePaintingMove}
            onMouseLeave={() => setTilt({ x: 0, y: 0 })}
            className="relative"
            style={{ perspective: '1000px' }}
          >
            <div
              className="relative animate-float rounded-lg border border-white/15 bg-white/5 p-2 shadow-2xl shadow-purple-900/60 sm:p-3 transition-transform duration-300 ease-out"
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
                  background: `linear-gradient(${105 + tilt.y * 6}deg, transparent 35%, rgba(255,255,255,0.12) 50%, transparent 65%)`,
                  opacity: tilt.x || tilt.y ? 1 : 0,
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-xl flex flex-col items-center md:items-start text-center md:text-left">
          <p className="animate-fade-up mb-4 inline-flex items-center gap-2 rounded border border-purple-400/30 bg-purple-500/10 px-4 py-1 text-xs font-medium uppercase tracking-[0.2em] text-purple-200" style={{ '--i': 1 }}>
            <span aria-hidden="true" className="text-purple-300">✦</span>
            <span key={roleIndex} aria-hidden="true" className="animate-word inline-block min-w-[6.5rem] text-left">{roles[roleIndex]}</span>
            <span className="sr-only">Engineer, dancer, dreamer, reader, traveller</span>
          </p>
          <h1 className="animate-fade-up font-display text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight text-white mb-6" style={{ '--i': 2 }}>
            Hi, I&apos;m <span className="text-glow italic">Kajal</span>.
            <span className="block text-2xl sm:text-3xl lg:text-4xl mt-2 text-purple-100/90">Welcome to my little corner of the internet.</span>
          </h1>
          <p className="animate-fade-up text-base sm:text-lg text-purple-100/80 leading-relaxed mb-8" style={{ '--i': 3 }}>
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
      {/* Removed grid of links to tabs. Tabs now only appear under Personal. */}
      {/* Recent entries section removed for a cleaner home page */}
    </div>
  )
}
