"use client"

import Link from "next/link"

import { useState, useEffect } from "react"
import { apiService } from "../../services/apiService"

export default function PersonalPage() {
  const [recentEntries, setRecentEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRecentEntries()
  }, [])


  const loadRecentEntries = async () => {
    try {
      setLoading(true)
      // Get recent entries from all categories
      const [entries, feedPosts] = await Promise.all([
        apiService.getRecentEntries(5),
        apiService.getAllFeedPosts()
      ])
      // Combine and sort by dateAdded (descending)
      const allRecents = [
        ...(entries || []),
        ...(feedPosts || []).map(post => ({
          ...post,
          type: 'feed',
          title: post.title || 'Feed Post',
          dateAdded: post.dateAdded
        }))
      ]
      allRecents.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
      setRecentEntries(allRecents.slice(0, 5))
    } catch (err) {
      console.error('Error loading recent entries:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-xl shadow-lg p-8 border border-blue-100 dark:border-gray-800">
  <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-8 text-center">Personal</h1>


  {/* Removed separate Feed link at the top. Feed remains in the grid below. */}

        {/* Recent Entries */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">Recently Added</h2>
          {loading ? (
            <>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center text-gray-400 dark:text-gray-300 animate-pulse">Loading recent entries...</div>
            </>
          ) : recentEntries.length > 0 ? (
            <div className="space-y-4">
              {recentEntries.map((entry, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 bg-white/80 rounded-md py-2 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{entry.title}</h3>
                    <span className="text-xs text-blue-500 dark:text-blue-300 capitalize px-2 py-1 rounded-full bg-blue-100/60 dark:bg-blue-900/60">{entry.type}</span>
                  </div>
                  <p className="text-gray-500 dark:text-gray-300 text-xs">
                    Added {new Date(entry.dateAdded).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-400 dark:text-gray-300 text-center">No recent entries yet.</div>
          )}
        </div>

        {/* Links to all sections */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          <Link href="/personal/movies" className="backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-lg p-8 border border-blue-100 dark:border-gray-800 hover:bg-blue-100/80 dark:hover:bg-gray-800/80 transition-all">
            <div className="text-center">
              <div className="text-3xl mb-3">🎬</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Movies</h3>
              <p className="text-gray-500 dark:text-gray-300">My movie watchlist and reviews</p>
            </div>
          </Link>
          <Link href="/personal/books" className="backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-lg p-8 border border-blue-100 dark:border-gray-800 hover:bg-blue-100/80 dark:hover:bg-gray-800/80 transition-all">
            <div className="text-center">
              <div className="text-3xl mb-3">📚</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Books</h3>
              <p className="text-gray-500 dark:text-gray-300">Reading list and takeaways</p>
            </div>
          </Link>
          <Link href="/personal/trips" className="backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-lg p-8 border border-blue-100 dark:border-gray-800 hover:bg-blue-100/80 dark:hover:bg-gray-800/80 transition-all">
            <div className="text-center">
              <div className="text-3xl mb-3">✈️</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Trips</h3>
              <p className="text-gray-500 dark:text-gray-300">Travel adventures and memories</p>
            </div>
          </Link>
          <Link href="/personal/restaurants" className="backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-lg p-8 border border-blue-100 dark:border-gray-800 hover:bg-blue-100/80 dark:hover:bg-gray-800/80 transition-all">
            <div className="text-center">
              <div className="text-3xl mb-3">🍽️</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Restaurants</h3>
              <p className="text-gray-500 dark:text-gray-300">Culinary discoveries</p>
            </div>
          </Link>
          <Link href="/personal/flats" className="backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-lg p-8 border border-blue-100 dark:border-gray-800 hover:bg-blue-100/80 dark:hover:bg-gray-800/80 transition-all">
            <div className="text-center">
              <div className="text-3xl mb-3">🏠</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Flats</h3>
              <p className="text-gray-500 dark:text-gray-300">Rental experiences and tips</p>
            </div>
          </Link>
          <Link href="/personal/feed" className="backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-lg p-8 border border-blue-100 dark:border-gray-800 hover:bg-blue-100/80 dark:hover:bg-gray-800/80 transition-all">
            <div className="text-center">
              <div className="text-3xl mb-3">📝</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Feed</h3>
              <p className="text-gray-500 dark:text-gray-300">Latest posts and updates</p>
            </div>
          </Link>
  </div>
  </div>
      </div>
  )
}
