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
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-center mb-12 gap-8">
        <div className="flex-1 flex justify-center items-center">
          <img
            src="/images/dancing_girl.webp"
            alt="Dancing Girl"
            className="w-full h-auto max-w-[700px] object-contain"
            style={{ minWidth: '300px', maxHeight: '80vh', background: 'transparent', boxShadow: 'none', borderRadius: 0 }}
          />
        </div>
        <div className="flex-1 flex flex-col justify-center items-center md:items-start text-center md:text-left">
          <h1 className="text-5xl font-extrabold text-white mb-8 text-center">
            Welcome to My Personal Blog
          </h1>
          <p className="text-lg text-white mb-6 text-center">
            Discover my favorite movies, books, trips, restaurants, and more. Explore, connect, and enjoy!
          </p>
        </div>
      </div>
      {/* Removed grid of links to tabs. Tabs now only appear under Personal. */}
      {/* Recent entries section removed for a cleaner home page */}
    </div>
  )
}
