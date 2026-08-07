"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { apiService } from "../services/apiService"

/**
 * Recently-added entries across categories. Not currently rendered in the app;
 * kept for reuse on feed or another page later.
 */
export default function RecentlyAdded() {
  const router = useRouter()
  const [recentEntries, setRecentEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRecentEntries()
  }, [])

  const handleRecentEntryClick = (entry) => {
    if (entry.slug && entry.type !== 'feed') {
      const pluralType = entry.type === 'movie' ? 'movies'
                      : entry.type === 'book' ? 'books'
                      : entry.type === 'trip' ? 'trips'
                      : entry.type === 'restaurant' ? 'restaurants'
                      : entry.type
      router.push(`/personal/${pluralType}/${entry.slug}`)
    }
  }

  const loadRecentEntries = async () => {
    try {
      setLoading(true)
      const entries = await apiService.getRecentEntries(5)
      const allRecents = [...(entries || [])]
      allRecents.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
      setRecentEntries(allRecents)
    } catch (err) {
      console.error('Error loading recent entries:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mb-8 sm:mb-12">
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 text-center">Recently Added</h2>
      {loading ? (
        <div className="text-center text-white animate-pulse">Loading recent entries...</div>
      ) : recentEntries.length > 0 ? (
        <div className="space-y-3 sm:space-y-4">
          {recentEntries.map((entry, index) => (
            <div
              key={index}
              className={`pl-2 sm:pl-4 py-2 flex flex-col gap-1 ${
                entry.slug && entry.type !== 'feed'
                  ? 'cursor-pointer hover:bg-purple-900/20 rounded transition-colors'
                  : ''
              }`}
              onClick={() => handleRecentEntryClick(entry)}
            >
              <div className="flex items-center justify-between">
                <h3 className={`font-semibold text-sm sm:text-base ${
                  entry.slug && entry.type !== 'feed'
                    ? 'text-purple-200 hover:text-white transition-colors'
                    : 'text-white'
                }`}>{entry.title}</h3>
                <span className={`text-xs capitalize px-2 py-1 ${
                  entry.slug && entry.type !== 'feed'
                    ? 'text-purple-300 bg-purple-950/30 rounded'
                    : 'text-purple-300'
                }`}>{entry.type}</span>
              </div>
              <p className="text-purple-200 text-xs">
                Added {new Date(entry.dateAdded).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-white text-center">No recent entries yet.</div>
      )}
    </div>
  )
}
