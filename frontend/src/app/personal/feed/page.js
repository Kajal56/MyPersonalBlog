
'use client'
import { useState, useEffect } from 'react'
import { apiService } from '../../../services/apiService'
import FeedPostModal from '../../../components/FeedPostModal'
import ConfirmDialog from '../../../components/ConfirmDialog'
import { useAdminMode } from '../../../components/AdminModeContext'
import { excerpt, readingTime, timeAgo } from '../../../utils/text'

const PREVIEW_LENGTH = 320

export default function FeedPage() {
  const { isAdminMode } = useAdminMode()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editPost, setEditPost] = useState(null)
  const [deletePost, setDeletePost] = useState(null)
  const [expanded, setExpanded] = useState(() => new Set())

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

  // Links from the home page point at #post-<id>: open that post and bring it into view
  useEffect(() => {
    if (loading || !window.location.hash.startsWith('#post-')) return
    const id = window.location.hash.slice('#post-'.length)
    setExpanded(prev => new Set(prev).add(id))
    requestAnimationFrame(() => document.getElementById(`post-${id}`)?.scrollIntoView({ behavior: 'smooth' }))
  }, [loading])

  const toggleExpanded = (id) => {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const renderPost = (post) => {
    const date = new Date(post.dateAdded)
    const isLong = (post.content || '').length > PREVIEW_LENGTH
    const isOpen = expanded.has(post.id)

    return (
      <article key={post.id} id={`post-${post.id}`} className="reveal grid scroll-mt-28 grid-cols-[3.5rem_1fr] gap-4 sm:grid-cols-[5rem_1fr] sm:gap-6">
        {/* Journal-style date column */}
        <div className="pt-5 text-center">
          <div className="font-display text-3xl font-semibold leading-none text-ink sm:text-4xl">{date.getDate()}</div>
          <div className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-accent-ink">
            {date.toLocaleDateString('en-GB', { month: 'short' })}
          </div>
          <div className="text-[11px] text-faint">{date.getFullYear()}</div>
        </div>

        <div className="card card-hover overflow-hidden">
          <div className="p-5 sm:p-6">
            <div className="mb-3 flex items-start justify-between gap-4">
              <div>
                {post.title && <h3 className="font-display text-2xl font-semibold text-ink">{post.title}</h3>}
                <p className="mt-1 text-xs uppercase tracking-wider text-muted">
                  {timeAgo(post.dateAdded)} · {readingTime(post.content)}
                </p>
              </div>
              {isAdminMode && (
                <div className="flex shrink-0 space-x-3">
                  <button onClick={() => handleEdit(post)} className="text-sm font-medium text-muted hover:text-ink">Edit</button>
                  <button onClick={() => handleDeleteClick(post)} className="text-sm font-medium text-danger hover:text-ink">Delete</button>
                </div>
              )}
            </div>

            <p className="whitespace-pre-wrap leading-relaxed text-ink">
              {isLong && !isOpen ? excerpt(post.content, PREVIEW_LENGTH) : post.content}
            </p>
            {isLong && (
              <button
                onClick={() => toggleExpanded(post.id)}
                aria-expanded={isOpen}
                className="mt-3 text-sm font-medium text-ink underline decoration-accent/40 underline-offset-4 hover:text-ink"
              >
                {isOpen ? 'Show less' : 'Keep reading →'}
              </button>
            )}

            {post.mediaData && (
              <div className="mt-4 flex justify-center">
                {post.mediaType === 'video' ? (
                  <video src={post.mediaData} controls className="h-auto max-h-[70vh] max-w-full rounded-lg border border-line object-contain" />
                ) : (
                  <img src={post.mediaData} alt="Post media" className="h-auto max-h-[70vh] max-w-full rounded-lg border border-line object-contain" />
                )}
              </div>
            )}

            {post.tags && post.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
                {post.tags.map((tag, index) => <span key={index} className="pill-tag">#{tag}</span>)}
              </div>
            )}
          </div>
        </div>
      </article>
    )
  }

    return (
      <div className="max-w-6xl mx-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="page-title mb-2">My venting place</h1>
              <p className="text-muted">Unfiltered thoughts, as they come.</p>
            </div>
            {isAdminMode && (
              <button
                onClick={() => setShowAddModal(true)}
                className="text-on-accent px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 shadow-lg bg-accent hover:bg-accent-hover"
              >
                <span>✨</span>
                <span>Share Something</span>
              </button>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="text-lg text-muted">Loading your posts...</div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-lg text-danger">{error}</div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💭</div>
              <h3 className="text-xl font-semibold text-ink mb-2">Nothing here yet</h3>
              <p className="text-muted mb-4">Share a thought when you&apos;re ready.</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="text-on-accent px-6 py-3 rounded-lg font-medium transition-all duration-300 bg-accent hover:bg-accent-hover"
              >
                ✨ Create Your First Post
              </button>
            </div>
          ) : (
            <div className="space-y-8">
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
