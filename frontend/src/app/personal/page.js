"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { apiService } from "../../services/apiService"

export default function PersonalPage() {
  const router = useRouter()
  const [recentEntries, setRecentEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRecentEntries()
  }, [])

  const handleRecentEntryClick = (entry) => {
    console.log('Recent entry clicked:', entry);
    console.log('Entry type:', entry.type);
    console.log('Entry slug:', entry.slug);
    
    if (entry.slug && entry.type !== 'feed') {
      // Navigate to slug-based URL - convert singular type to plural for URL
      const pluralType = entry.type === 'movie' ? 'movies' 
                      : entry.type === 'book' ? 'books'
                      : entry.type === 'trip' ? 'trips'
                      : entry.type === 'restaurant' ? 'restaurants'
                      : entry.type;
      const url = `/personal/${pluralType}/${entry.slug}`;
      console.log('Navigating to:', url);
      router.push(url);
    } else {
      console.log('No slug or is feed entry, not navigating');
    }
    // For feed entries or entries without slugs, we could add modal or other handling
  }


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
    <div className="min-h-screen py-4 px-2 sm:py-8 sm:px-4" style={{paddingBottom: 'env(safe-area-inset-bottom)'}}>
      <div className="w-full max-w-screen-lg mx-auto">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-4 sm:mb-6 md:mb-8 text-center">Personal</h1>
        {/* Links to all sections */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 md:gap-8 mt-6 sm:mt-8 md:mt-12 mb-6 sm:mb-10 md:mb-12">
          <Link href="/personal/movies" className="p-5 sm:p-8 transition-all">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">🎬</div>
              <h3 className="text-base sm:text-lg font-semibold text-white">Movies</h3>
              <p className="text-white text-sm sm:text-base">My movie watchlist and reviews</p>
            </div>
          </Link>
          <Link href="/personal/books" className="p-5 sm:p-8 transition-all">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">📚</div>
              <h3 className="text-base sm:text-lg font-semibold text-white">Books</h3>
              <p className="text-white text-sm sm:text-base">Reading list and takeaways</p>
            </div>
          </Link>
          <Link href="/personal/trips" className="p-5 sm:p-8 transition-all">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">✈️</div>
              <h3 className="text-base sm:text-lg font-semibold text-white">Trips</h3>
              <p className="text-white text-sm sm:text-base">Travel adventures and memories</p>
            </div>
          </Link>
          {isAdminMode && (
            <Link href="/personal/restaurants" className="p-5 sm:p-8 transition-all">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">🍽️</div>
                <h3 className="text-base sm:text-lg font-semibold text-white">Restaurants</h3>
                <p className="text-white text-sm sm:text-base">Culinary discoveries</p>
              </div>
            </Link>
          )}
          {isAdminMode && (
            <Link href="/personal/flats" className="p-5 sm:p-8 transition-all">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">🏠</div>
                <h3 className="text-base sm:text-lg font-semibold text-white">Flats</h3>
                <p className="text-white text-sm sm:text-base">Rental experiences and tips</p>
              </div>
            </Link>
          )}
          <Link href="/personal/feed" className="p-5 sm:p-8 transition-all">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">📝</div>
              <h3 className="text-base sm:text-lg font-semibold text-white">Feed</h3>
              <p className="text-white text-sm sm:text-base">Latest posts and updates</p>
            </div>
          </Link>
        </div>
        {/* Recently Added below all sections */}
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
      </div>
    </div>
  )
}
