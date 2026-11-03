'use client'
import { useEffect } from 'react'

// Site-wide motion helpers:
// - `.reveal` elements fade up when they scroll into view (staggered per batch)
// - `.glass-card` / `.glass-card-bright` get a spotlight that follows the cursor
export default function MotionEffects() {
  useEffect(() => {
    const root = document.documentElement
    root.classList.add('reveal-ready')

    const observer = new IntersectionObserver(
      (entries) => {
        let batch = 0
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.style.setProperty('--i', String(batch++))
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )

    const observeNew = () => {
      document.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => observer.observe(el))
    }
    observeNew()

    // Cards are rendered after data loads and on client-side navigation
    const mutations = new MutationObserver(observeNew)
    mutations.observe(document.body, { childList: true, subtree: true })

    const handlePointerMove = (e) => {
      const card = e.target.closest?.('.glass-card, .glass-card-bright')
      if (!card) return
      const rect = card.getBoundingClientRect()
      card.style.setProperty('--mx', `${e.clientX - rect.left}px`)
      card.style.setProperty('--my', `${e.clientY - rect.top}px`)
    }
    document.addEventListener('pointermove', handlePointerMove, { passive: true })

    return () => {
      observer.disconnect()
      mutations.disconnect()
      document.removeEventListener('pointermove', handlePointerMove)
      root.classList.remove('reveal-ready')
    }
  }, [])

  return null
}
