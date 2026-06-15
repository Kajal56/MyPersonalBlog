const express = require('express');
const multer = require('multer');
const router = express.Router();
const databaseService = require('../services/databaseService');

// In-memory storage: Vercel serverless has a read-only filesystem (only /tmp is writable).
// Files are converted to base64 for the database, so disk storage is unnecessary.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow images and videos
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images and videos are allowed!'));
    }
  }
});

const handleMediaUpload = (req, res, next) => {
  upload.single('media')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ success: false, error: 'File too large. Maximum size is 10MB.' });
      }
      console.error('Feed media upload error:', err);
      return res.status(400).json({ success: false, error: err.message || 'File upload failed' });
    }
    next();
  });
};

// Get all feed posts
router.get('/', async (req, res) => {
  try {
    const posts = await databaseService.getAllFeedPosts();
    res.json({ success: true, data: posts });
  } catch (error) {
    console.error('Error fetching feed posts:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch feed posts' });
  }
});

// Get feed post by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const post = await databaseService.getFeedPostById(id);
    
    if (!post) {
      return res.status(404).json({ success: false, error: 'Feed post not found' });
    }
    
    res.json({ success: true, data: post });
  } catch (error) {
    console.error('Error fetching feed post:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch feed post' });
  }
});

// Create new feed post (with optional file upload)
router.post('/', handleMediaUpload, async (req, res) => {
  try {
    const postData = req.body;
    
    // Validate required fields
    if (!postData.content) {
      return res.status(400).json({ 
        success: false, 
        error: 'Content is required' 
      });
    }

    // Parse tags if they exist (they come as JSON string from FormData)
    if (postData.tags) {
      try {
        postData.tags = JSON.parse(postData.tags);
      } catch (e) {
        // If parsing fails, treat as comma-separated string
        postData.tags = postData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
      }
    }

    // Add media information if file was uploaded
    if (req.file) {
      postData.mediaType = req.file.mimetype.startsWith('image/') ? 'image' : 'video';
      const base64Data = req.file.buffer.toString('base64');
      postData.mediaData = `data:${req.file.mimetype};base64,${base64Data}`;
    }

    const newPost = await databaseService.createFeedPost(postData);
    res.status(201).json({ success: true, data: newPost });
  } catch (error) {
    console.error('Error creating feed post:', error);
    res.status(500).json({ success: false, error: 'Failed to create feed post' });
  }
});

// Update feed post
router.put('/:id', handleMediaUpload, async (req, res) => {
  try {
    const { id } = req.params;
    const postData = req.body;
    
    // Parse tags if they exist (they come as JSON string from FormData)
    if (postData.tags) {
      try {
        postData.tags = JSON.parse(postData.tags);
      } catch (e) {
        // If parsing fails, treat as comma-separated string
        postData.tags = postData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
      }
    }
    
    // Add media information if new file was uploaded
    if (req.file) {
      postData.mediaType = req.file.mimetype.startsWith('image/') ? 'image' : 'video';
      const base64Data = req.file.buffer.toString('base64');
      postData.mediaData = `data:${req.file.mimetype};base64,${base64Data}`;
    }
    
    const updatedPost = await databaseService.updateFeedPost(id, postData);
    
    if (!updatedPost) {
      return res.status(404).json({ success: false, error: 'Feed post not found' });
    }
    
    res.json({ success: true, data: updatedPost });
  } catch (error) {
    console.error('Error updating feed post:', error);
    res.status(500).json({ success: false, error: 'Failed to update feed post' });
  }
});

// Delete feed post
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedPost = await databaseService.deleteFeedPost(id);
    
    if (!deletedPost) {
      return res.status(404).json({ success: false, error: 'Feed post not found' });
    }
    
    res.json({ success: true, data: deletedPost });
  } catch (error) {
    console.error('Error deleting feed post:', error);
    res.status(500).json({ success: false, error: 'Failed to delete feed post' });
  }
});

module.exports = router;
