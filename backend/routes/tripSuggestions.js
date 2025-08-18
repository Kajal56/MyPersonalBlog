const express = require('express');
const router = express.Router();
const databaseService = require('../services/databaseService');

// PATCH /api/tripSuggestions/:id
router.patch('/:id', async (req, res) => {
  try {
    const updated = await databaseService.updateTripSuggestion(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update trip suggestion', details: error.message });
  }
});

// DELETE /api/tripSuggestions/:id
router.delete('/:id', async (req, res) => {
  try {
    await databaseService.deleteTripSuggestion(req.params.id);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete trip suggestion', details: error.message });
  }
});

// GET /api/tripSuggestions
router.get('/', async (req, res) => {
  try {
    const suggestions = await databaseService.getAllTripSuggestions();
    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trip suggestions', details: error.message });
  }
});

// POST /api/tripSuggestions
router.post('/', async (req, res) => {
  try {
    const suggestion = await databaseService.addTripSuggestion(req.body);
    res.status(201).json(suggestion);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save trip suggestion', details: error.message });
  }
});

// PUT /api/tripSuggestions/:id
router.put('/:id', async (req, res) => {
  try {
    const updated = await databaseService.updateTripSuggestion(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update trip suggestion', details: error.message });
  }
});

module.exports = router;
