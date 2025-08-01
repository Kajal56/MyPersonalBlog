'use client'
import { useState } from 'react'
import { apiService } from '../services/apiService'

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
        const response = await fetch(`http://localhost:5000/api/feed/${editPost.id}`, {
          method: 'PUT',
          body: submitData
        })
        result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Failed to update post')
      } else {
        // For creating, also use custom fetch
        const response = await fetch('http://localhost:5000/api/feed', {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {isEditing ? 'Edit Post' : 'Create New Post'} ✨
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            {/* Title - Optional */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title (Optional)
              </label>
              <input
                type="text"
                value={formData.title}
                placeholder="Give your post a catchy title..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => handleInputChange('title', e.target.value)}
              />
            </div>

            {/* Content - Required */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What's on your mind? <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={formData.content}
                placeholder="Share your thoughts, experiences, or anything you want to remember! You can write as much as you like..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                rows={6}
                onChange={(e) => handleInputChange('content', e.target.value)}
              />
              <div className="text-sm text-gray-500 mt-1">
                💡 Tip: You can write about anything - your day, thoughts, experiences, or random musings!
              </div>
            </div>

            {/* Media Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📸 Add Photo or Video (Optional)
              </label>
              
              {!previewUrl ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
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
                    <div className="text-sm text-gray-600">
                      <span className="font-medium text-blue-600 hover:text-blue-500">
                        Click to upload
                      </span>{' '}
                      or drag and drop
                    </div>
                    <div className="text-xs text-gray-500">
                      PNG, JPG, GIF, MP4 up to 10MB
                    </div>
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    {previewUrl.includes('video') || previewUrl.includes('data:video') ? (
                      <video 
                        src={previewUrl} 
                        controls 
                        className="w-full max-h-64 object-cover"
                      />
                    ) : (
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="w-full max-h-64 object-cover"
                      />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                  >
                    ✕
                  </button>
                  <div className="mt-2 text-center">
                    <label
                      htmlFor="media-upload"
                      className="text-sm text-blue-600 hover:text-blue-500 cursor-pointer"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags/Hashtags
              </label>
              <input
                type="text"
                value={formData.tags}
                placeholder="mood, life, thoughts, random (comma separated)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => handleInputChange('tags', e.target.value)}
              />
              <div className="text-sm text-gray-500 mt-1">
                🏷️ Add tags to categorize your posts (separate with commas)
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 transition-all"
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
