'use client'
import { useState } from 'react'
import { apiService } from '../services/apiService'

const getApiBaseUrl = () => {
  const configuredUrl = process.env.NEXT_PUBLIC_API_URL
  if (configuredUrl) {
    return configuredUrl
  }
  return process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api'
}

export default function FeedPostModal({ onClose, onPostAdded, editPost = null }) {
  const [formData, setFormData] = useState(() => {
    if (editPost) {
      return {
        title: editPost.title || '',
        content: editPost.content || '',
        tags: editPost.tags ? editPost.tags.join(', ') : ''
      }
    }
    return {
      title: '',
      content: '',
      tags: ''
    }
  })
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(editPost?.mediaData || null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const apiBaseUrl = getApiBaseUrl()

  const isEditing = !!editPost

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      // Create preview URL
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    // Reset file input
    const fileInput = document.getElementById('media-upload')
    if (fileInput) fileInput.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      // Create FormData for file upload
      const submitData = new FormData()
      
      // Add text fields
      if (formData.title) submitData.append('title', formData.title)
      submitData.append('content', formData.content)
      
      // Process tags
      if (formData.tags) {
        const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        submitData.append('tags', JSON.stringify(tagsArray))
      }
      
      // Add file if selected
      if (selectedFile) {
        submitData.append('media', selectedFile)
      }

      console.log('Submitting feed post with FormData')

      let result
      if (isEditing) {
        // For editing, we'll use a custom fetch since apiService doesn't handle FormData well
        const response = await fetch(`${apiBaseUrl}/feed/${editPost.id}`, {
          method: 'PUT',
          body: submitData
        })
        result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Failed to update post')
      } else {
        // For creating, also use custom fetch
        const response = await fetch(`${apiBaseUrl}/feed`, {
          method: 'POST',
          body: submitData
        })
        result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Failed to create post')
      }

      console.log('Response:', result)
      
      onClose()
      if (onPostAdded) {
        onPostAdded()
      }
    } catch (error) {
      setError(`Failed to ${isEditing ? 'update' : 'create'} post. Please try again.`)
      console.error(`Error ${isEditing ? 'updating' : 'creating'} post:`, error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 z-50" style={{paddingBottom: 'env(safe-area-inset-bottom)'}}>
    <div className="bg-surface rounded-lg w-full max-w-[98vw] sm:max-w-md md:max-w-lg max-h-[90dvh] overflow-y-auto" style={{boxSizing: 'border-box'}}>
      <div className="p-2 sm:p-4 md:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-ink">
              {isEditing ? 'Edit Post' : 'Create New Post'} ✨
            </h2>
            <button
              onClick={onClose}
              className="text-muted hover:text-muted text-xl"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-3 md:space-y-4">
            {error && (
              <div className="bg-danger-soft border border-danger text-danger px-4 py-3 rounded">
                {error}
              </div>
            )}
            {/* Title - Optional */}
            <div>
              <label className="block text-sm font-medium text-muted mb-2">
                Title (Optional)
              </label>
              <input
                type="text"
                value={formData.title}
                placeholder="Give your post a catchy title..."
                className="w-full px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 border border-line rounded-md bg-surface text-xs sm:text-sm md:text-base text-ink focus:outline-none focus:ring-2 focus:ring-accent/30"
                onChange={(e) => handleInputChange('title', e.target.value)}
              />
            </div>

            {/* Content - Required */}
            <div>
              <label className="block text-sm font-medium text-muted mb-2">
                What's on your mind? <span className="text-danger">*</span>
              </label>
              <textarea
                required
                value={formData.content}
                placeholder="Share your thoughts, experiences, or anything you want to remember! You can write as much as you like..."
                className="w-full px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 border border-line rounded-md bg-surface text-xs sm:text-sm md:text-base text-ink focus:outline-none focus:ring-2 focus:ring-accent/30 min-h-[120px]"
                rows={6}
                onChange={(e) => handleInputChange('content', e.target.value)}
              />
              <div className="text-sm text-muted mt-1">
                💡 Tip: You can write about anything - your day, thoughts, experiences, or random musings!
              </div>
            </div>

            {/* Media Upload */}
            <div>
              <label className="block text-sm font-medium text-muted mb-2">
                📸 Add Photo or Video (Optional)
              </label>
              {!previewUrl ? (
                <div className="border-2 border-dashed border-line rounded-lg p-6 text-center hover:border-accent/60 transition-colors bg-surface">
                  <input
                    id="media-upload"
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <label
                    htmlFor="media-upload"
                    className="cursor-pointer flex flex-col items-center space-y-2"
                  >
                    <div className="text-4xl">📷</div>
                    <div className="text-sm text-muted">
                      <span className="font-medium text-accent-ink hover:text-accent-ink">
                        Click to upload
                      </span>{' '}
                      or drag and drop
                    </div>
                    <div className="text-xs text-muted">
                      PNG, JPG, GIF, MP4 up to 10MB
                    </div>
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <div className="border border-line rounded-lg overflow-hidden bg-surface">
                    {previewUrl.includes('video') || previewUrl.includes('data:video') ? (
                      <video 
                        src={previewUrl} 
                        controls 
                        className="max-w-full h-auto max-h-64 object-contain mx-auto"
                      />
                    ) : (
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="max-w-full h-auto max-h-64 object-contain mx-auto"
                      />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="absolute top-2 right-2 bg-danger text-on-accent rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-danger"
                  >
                    ✕
                  </button>
                  <div className="mt-2 text-center">
                    <label
                      htmlFor="media-upload"
                      className="text-sm text-accent-ink hover:text-accent-ink cursor-pointer"
                    >
                      📸 Change media
                    </label>
                    <input
                      id="media-upload"
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-muted mb-2">
                Tags/Hashtags
              </label>
              <input
                type="text"
                value={formData.tags}
                placeholder="mood, life, thoughts, random (comma separated)"
                className="w-full px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 border border-line rounded-md bg-surface text-xs sm:text-sm md:text-base text-ink focus:outline-none focus:ring-2 focus:ring-accent/30"
                onChange={(e) => handleInputChange('tags', e.target.value)}
              />
              <div className="text-sm text-muted mt-1">
                🏷️ Add tags to categorize your posts (separate with commas)
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-line rounded-md text-muted hover:bg-sunken"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 text-on-accent rounded-md disabled:opacity-50 transition-all bg-accent hover:bg-accent-hover"
              >
                {isSubmitting ? (isEditing ? 'Updating...' : 'Posting...') : (isEditing ? 'Update Post' : 'Share Post')} 
                {!isSubmitting && ' 🚀'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
