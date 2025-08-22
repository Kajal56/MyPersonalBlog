const express = require('express');
const router = express.Router();
const databaseService = require('../services/databaseService');

function logError(error, req) {
  console.error('Error in', req.method, req.originalUrl);
  if (error instanceof Error) {
    console.error(error.stack);
  } else {
    console.error(error);
  }
}

// POST /api/movies/suggestions
router.post('/', async (req, res) => {
  try {
    console.log('Creating movie suggestion with data:', req.body);
    const suggestion = await databaseService.addMovieSuggestion(req.body);
    res.status(201).json(suggestion);
  } catch (error) {
    logError(error, req);
    res.status(500).json({ error: 'Failed to create suggestion', details: error.message });
  }
});

// GET /api/movies/suggestions
router.get('/', async (req, res) => {
  try {
    const suggestions = await databaseService.getAllMovieSuggestions();
    res.json(suggestions);
  } catch (error) {
    logError(error, req);
    res.status(500).json({ error: 'Failed to fetch suggestions', details: error.message });
  }
});

// PATCH /api/movies/suggestions/:id
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await databaseService.updateMovieSuggestion(id, req.body);
    res.json(updated);
  } catch (error) {
    logError(error, req);
    res.status(500).json({ error: 'Failed to update suggestion', details: error.message });
  }
});

// DELETE /api/movies/suggestions/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await databaseService.deleteMovieSuggestion(id);
    res.status(204).end();
  } catch (error) {
    logError(error, req);
    res.status(500).json({ error: 'Failed to delete suggestion', details: error.message });
  }
});

module.exports = router;
