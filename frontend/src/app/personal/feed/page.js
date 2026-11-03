
'use client'
import { useState, useEffect } from 'react'
import { apiService } from '../../../services/apiService'
import FeedPostModal from '../../../components/FeedPostModal'
import ConfirmDialog from '../../../components/ConfirmDialog'
// ...existing code...
import { useAdminMode } from '../../../components/AdminModeContext'

export default function FeedPage() {
  const { isAdminMode } = useAdminMode()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editPost, setEditPost] = useState(null)
  const [deletePost, setDeletePost] = useState(null)

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiService.getAllFeedPosts()
      setPosts(data || [])
    } catch (err) {
      setError('Failed to load posts')
    } finally {
      setLoading(false)
    }
  }

  const handlePostAdded = () => {
    loadPosts()
  }

  const handleEdit = (post) => {
    setEditPost(post)
  }

  const handleDeleteClick = (post) => {
    setDeletePost(post)
  }

  const handleDeleteConfirm = async () => {
    if (!deletePost) return
    try {
      await apiService.deleteFeedPost(deletePost.id)
      setPosts(posts.filter(post => post.id !== deletePost.id))
      setDeletePost(null)
    } catch (error) {
      setDeletePost(null)
    }
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    setEditPost(null)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    if (diffDays === 0) {
      return 'Today'
    } else if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays < 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const renderPost = (post) => (
  <article key={post.id} className="glass-card-bright card-hover reveal overflow-hidden">
      <div className="px-5 pt-5 pb-4 sm:px-6 border-b border-white/10">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            {post.title && (
              <h3 className="font-display text-2xl font-semibold text-white mb-1">
                {post.title}
              </h3>
            )}
            <div className="flex items-center text-sm text-purple-200">
              <span className="text-xs uppercase tracking-wider">{formatDate(post.dateAdded)}</span>
            </div>
          </div>
          {isAdminMode && (
            <div className="flex space-x-2 ml-4">
              <button
                onClick={() => handleEdit(post)}
                className="text-purple-300 hover:text-white text-sm font-medium"
              >
                ✏️ Edit
              </button>
              <button 
                onClick={() => handleDeleteClick(post)}
                className="text-red-400 hover:text-white text-sm font-medium"
              >
                🗑️ Delete
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="p-5 sm:p-6">
        <div className="prose prose-sm max-w-none">
          <p className="text-white whitespace-pre-wrap leading-relaxed">
            {post.content}
          </p>
        </div>
        {post.mediaData && (
          <div className="mt-4 flex justify-center">
            {post.mediaType === 'video' ? (
              <video 
                src={post.mediaData} 
                controls 
                className="max-w-full h-auto max-h-[70vh] object-contain rounded-xl border border-white/10"
              />
            ) : (
              <img 
                src={post.mediaData} 
                alt="Post media" 
                className="max-w-full h-auto max-h-[70vh] object-contain rounded-xl border border-white/10"
              />
            )}
          </div>
        )}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-5 pt-4 border-t border-white/10">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="pill-tag"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  )

    return (
      <div className="max-w-6xl mx-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="page-title mb-2">My venting place</h1>
              <p className="text-purple-200/80">Unfiltered thoughts, as they come.</p>
            </div>
            {isAdminMode && (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 shadow-lg"
              >
                <span>✨</span>
                <span>Share Something</span>
              </button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="text-lg text-gray-600 dark:text-gray-300">Loading your posts...</div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-lg text-red-600 dark:text-red-400">{error}</div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💭</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Nothing here yet</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Share a thought when you&apos;re ready.</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300"
              >
                ✨ Create Your First Post
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map(renderPost)}
            </div>
          )}

          {(isAdminMode && (showAddModal || editPost)) && (
            <FeedPostModal
              editPost={editPost}
              onClose={handleCloseModal}
              onPostAdded={handlePostAdded}
            />
          )}

          {deletePost && (
            <ConfirmDialog
              isOpen={true}
              onConfirm={handleDeleteConfirm}
              onCancel={() => setDeletePost(null)}
              title="Delete Post"
              message={`Are you sure you want to delete this post? This action cannot be undone.`}
              confirmText="Delete"
              cancelText="Cancel"
            />
          )}
        </div>
      </div>
    )
}
