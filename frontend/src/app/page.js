'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { apiService } from '../services/apiService'

export default function Home() {
  const [recentEntries, setRecentEntries] = useState([])
  const [loading, setLoading] = useState(true)

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
      <div className="flex flex-col md:flex-row items-center justify-center mb-6 sm:mb-10 md:mb-12 gap-4 sm:gap-8">
        <div className="flex-1 flex justify-center md:justify-start items-center min-w-[220px] sm:min-w-[400px] md:min-w-[500px]">
          <img
            src="/images/dancing_girl.webp"
            alt="Dancing Girl"
            className="w-full h-auto max-w-[400px] sm:max-w-[700px] md:max-w-[1000px] lg:max-w-[1200px] object-contain"
            style={{ maxHeight: '80vh', background: 'transparent', boxShadow: 'none', borderRadius: 0 }}
          />
        </div>
        <div className="flex-1 flex flex-col justify-center items-center text-center">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 sm:mb-6 md:mb-8 text-center">
            Welcome to My Personal Blog
          </h1>
          <p className="text-sm sm:text-lg md:text-xl text-white mb-2 sm:mb-4 md:mb-6 text-center">
            <span className="text-xs sm:text-sm md:text-base">Discover my favorite movies, books, trips, restaurants, and more. Explore, connect, and enjoy!</span>
          </p>
        </div>
      </div>
      {/* Removed grid of links to tabs. Tabs now only appear under Personal. */}
      {/* Recent entries section removed for a cleaner home page */}
    </div>
  )
}
