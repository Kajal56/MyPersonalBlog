const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const databaseService = require('../services/databaseService');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
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
router.post('/', upload.single('media'), async (req, res) => {
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
      // Convert file to Base64
      const fs = require('fs');
      const fileBuffer = fs.readFileSync(req.file.path);
      const base64Data = fileBuffer.toString('base64');
      postData.mediaData = `data:${req.file.mimetype};base64,${base64Data}`;
      
      // Clean up the temporary file
      fs.unlinkSync(req.file.path);
    }

    const newPost = await databaseService.createFeedPost(postData);
    res.status(201).json({ success: true, data: newPost });
  } catch (error) {
    console.error('Error creating feed post:', error);
    res.status(500).json({ success: false, error: 'Failed to create feed post' });
  }
});

// Update feed post
router.put('/:id', upload.single('media'), async (req, res) => {
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
      // Convert file to Base64
      const fs = require('fs');
      const fileBuffer = fs.readFileSync(req.file.path);
      const base64Data = fileBuffer.toString('base64');
      postData.mediaData = `data:${req.file.mimetype};base64,${base64Data}`;
      
      // Clean up the temporary file
      fs.unlinkSync(req.file.path);
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
