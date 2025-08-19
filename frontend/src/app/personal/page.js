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
      const [entries, feedPosts] = await Promise.all([
        apiService.getRecentEntries(5),
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
      setRecentEntries(allRecents)
    } catch (err) {
      console.error('Error loading recent entries:', err)
    } finally {
      setLoading(false)
    }
  }

  // Only show Flats and Restaurants if user is admin
  const [isAdminMode, setIsAdminMode] = useState(false);
  useEffect(() => {
    // Check admin mode from localStorage/context if available
    setIsAdminMode(localStorage.getItem('isAdminMode') === 'true');
  }, []);

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold text-white mb-8 text-center">Personal</h1>
        {/* Links to all sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 mb-12">
          <Link href="/personal/movies" className="p-8 transition-all">
            <div className="text-center">
              <div className="text-3xl mb-3">🎬</div>
              <h3 className="text-lg font-semibold text-white">Movies</h3>
              <p className="text-white">My movie watchlist and reviews</p>
            </div>
          </Link>
          <Link href="/personal/books" className="p-8 transition-all">
            <div className="text-center">
              <div className="text-3xl mb-3">📚</div>
              <h3 className="text-lg font-semibold text-white">Books</h3>
              <p className="text-white">Reading list and takeaways</p>
            </div>
          </Link>
          <Link href="/personal/trips" className="p-8 transition-all">
            <div className="text-center">
              <div className="text-3xl mb-3">✈️</div>
              <h3 className="text-lg font-semibold text-white">Trips</h3>
              <p className="text-white">Travel adventures and memories</p>
            </div>
          </Link>
          {isAdminMode && (
            <Link href="/personal/restaurants" className="p-8 transition-all">
              <div className="text-center">
                <div className="text-3xl mb-3">🍽️</div>
                <h3 className="text-lg font-semibold text-white">Restaurants</h3>
                <p className="text-white">Culinary discoveries</p>
              </div>
            </Link>
          )}
          {isAdminMode && (
            <Link href="/personal/flats" className="p-8 transition-all">
              <div className="text-center">
                <div className="text-3xl mb-3">🏠</div>
                <h3 className="text-lg font-semibold text-white">Flats</h3>
                <p className="text-white">Rental experiences and tips</p>
              </div>
            </Link>
          )}
          <Link href="/personal/feed" className="p-8 transition-all">
            <div className="text-center">
              <div className="text-3xl mb-3">📝</div>
              <h3 className="text-lg font-semibold text-white">Feed</h3>
              <p className="text-white">Latest posts and updates</p>
            </div>
          </Link>
        </div>
        {/* Recently Added below all sections */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Recently Added</h2>
          {loading ? (
            <div className="text-center text-white animate-pulse">Loading recent entries...</div>
          ) : recentEntries.length > 0 ? (
            <div className="space-y-4">
              {recentEntries.map((entry, index) => (
                <div key={index} className="pl-4 py-2 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white">{entry.title}</h3>
                    <span className="text-xs text-blue-300 capitalize px-2 py-1">{entry.type}</span>
                  </div>
                  <p className="text-white text-xs">
                    Added {new Date(entry.dateAdded).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-white text-center">No recent entries yet.</div>
          )}
        </div>
      </div>
    </div>
  )
}
