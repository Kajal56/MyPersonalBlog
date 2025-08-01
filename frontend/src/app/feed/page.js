'use client'

import { useState, useEffect } from 'react'
import { apiService } from '../../services/apiService'
import FeedPostModal from '../../components/FeedPostModal'
import ConfirmDialog from '../../components/ConfirmDialog'

export default function FeedPage() {
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
      console.error('Error loading posts:', err)
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
      console.error('Error deleting post:', error)
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
    <div key={post.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      {/* Post Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            {post.title && (
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {post.title}
              </h3>
            )}
            <div className="flex items-center text-sm text-gray-500">
              <span>📅 {formatDate(post.dateAdded)}</span>
            </div>
          </div>
          <div className="flex space-x-2 ml-4">
            <button
              onClick={() => handleEdit(post)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              ✏️ Edit
            </button>
            <button 
              onClick={() => handleDeleteClick(post)}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="p-4">
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
            {post.content}
          </p>
        </div>

        {/* Media */}
        {post.mediaData && (
          <div className="mt-4">
            {post.mediaType === 'video' ? (
              <video 
                src={post.mediaData} 
                controls 
                className="w-full max-h-96 object-cover rounded-lg border border-gray-200"
              />
            ) : (
              <img 
                src={post.mediaData} 
                alt="Post media" 
                className="w-full max-h-96 object-cover rounded-lg border border-gray-200"
              />
            )}
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-xs rounded-full border border-blue-200"
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
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📱 My Feed
          </h1>
          <p className="text-gray-600">Your personal Instagram-style timeline</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 shadow-lg"
        >
          <span>✨</span>
          <span>Share Something</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-lg text-gray-600">Loading your posts...</div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="text-lg text-red-600">{error}</div>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📱</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Your feed is empty</h3>
          <p className="text-gray-600 mb-4">Start sharing your thoughts, experiences, or anything that's on your mind!</p>
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

      {/* Add/Edit Modal */}
      {(showAddModal || editPost) && (
        <FeedPostModal
          editPost={editPost}
          onClose={handleCloseModal}
          onPostAdded={handlePostAdded}
        />
      )}

      {/* Delete Confirmation */}
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
  )
}
