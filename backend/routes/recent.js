const express = require('express');
const router = express.Router();
const databaseService = require('../services/databaseService');

// GET /api/recent - Get recent entries from all categories
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const recentEntries = await databaseService.getRecentEntries(limit);
    res.json(recentEntries);
  } catch (error) {
    console.error('Error fetching recent entries:', error);
    res.status(500).json({
      error: 'Failed to fetch recent entries',
      message: error.message
    });
  }
});

module.exports = router;
