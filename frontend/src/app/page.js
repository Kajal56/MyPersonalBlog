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
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to My Personal Blog
        </h1>
        <p className="text-xl text-gray-600">
          Tracking my journey through movies, books, trips, and great food
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Link href="/movies" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="text-center">
            <div className="text-3xl mb-3">🎬</div>
            <h3 className="text-lg font-semibold text-gray-900">Movies</h3>
            <p className="text-gray-600">My movie watchlist and reviews</p>
          </div>
        </Link>

        <Link href="/books" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="text-center">
            <div className="text-3xl mb-3">📚</div>
            <h3 className="text-lg font-semibold text-gray-900">Books</h3>
            <p className="text-gray-600">Reading list and takeaways</p>
          </div>
        </Link>

        <Link href="/trips" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="text-center">
            <div className="text-3xl mb-3">✈️</div>
            <h3 className="text-lg font-semibold text-gray-900">Trips</h3>
            <p className="text-gray-600">Travel adventures and memories</p>
          </div>
        </Link>

        <Link href="/restaurants" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="text-center">
            <div className="text-3xl mb-3">🍽️</div>
            <h3 className="text-lg font-semibold text-gray-900">Restaurants</h3>
            <p className="text-gray-600">Culinary discoveries</p>
          </div>
        </Link>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Updates</h2>
          <div className="text-center py-4">
            <div className="text-gray-600">Loading recent entries...</div>
          </div>
        </div>
      ) : recentEntries.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Updates</h2>
          <div className="space-y-4">
            {recentEntries.map((entry, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{entry.title}</h3>
                  <span className="text-sm text-gray-500 capitalize">{entry.type}</span>
                </div>
                <p className="text-gray-600 text-sm mt-1">
                  Added {new Date(entry.dateAdded).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
