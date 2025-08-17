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

  {/* Removed grid of links to tabs. Tabs now only appear under Personal. */}

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
