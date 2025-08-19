
'use client'
import { useState, useEffect } from 'react'
import { apiService } from '../../../services/apiService'
import FeedPostModal from '../../../components/FeedPostModal'
import ConfirmDialog from '../../../components/ConfirmDialog'
// ...existing code...
import { useAdminMode } from '../../../components/AdminModeContext'
import PersonalTabs from '../../../components/PersonalTabs'

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
  <div key={post.id} className="bg-gradient-to-br from-[#2D0036] to-[#6600CC] shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="p-4 border-b border-purple-900">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            {post.title && (
              <h3 className="text-lg font-semibold text-white mb-1">
                {post.title}
              </h3>
            )}
            <div className="flex items-center text-sm text-purple-200">
              <span>📅 {formatDate(post.dateAdded)}</span>
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
      <div className="p-4">
        <div className="prose prose-sm max-w-none">
          <p className="text-white whitespace-pre-wrap leading-relaxed">
            {post.content}
          </p>
        </div>
        {post.mediaData && (
          <div className="mt-4">
            {post.mediaType === 'video' ? (
              <video 
                src={post.mediaData} 
                controls 
                className="w-full max-h-96 object-cover border border-purple-900"
              />
            ) : (
              <img 
                src={post.mediaData} 
                alt="Post media" 
                className="w-full max-h-96 object-cover border border-purple-900"
              />
            )}
          </div>
        )}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-4 pt-3 border-t border-purple-900">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-purple-900 text-purple-200 text-xs border border-purple-900"
                  style={{ borderRadius: 0 }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )

    return (
      <div className="max-w-6xl mx-auto">
        <PersonalTabs />
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">📱 My Feed</h1>
              <p className="text-white">Your personal Instagram-style timeline</p>
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
              <div className="text-6xl mb-4">📱</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Your feed is empty</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Start sharing your thoughts, experiences, or anything that's on your mind!</p>
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
