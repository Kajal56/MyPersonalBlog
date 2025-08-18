
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const databaseService = require('../services/databaseService');

// Helper: log errors with stack trace
function logError(error, req) {
  console.error('Error in', req.method, req.originalUrl);
  if (error instanceof Error) {
    console.error(error.stack);
  } else {
    console.error(error);
  }
}

// POST /api/books/suggestions
router.post('/', async (req, res) => {
  try {
    const { title, author, description } = req.body;
    // No required field validation
    console.log('Creating book suggestion:', { title, author, description });

  const suggestion = await databaseService.addBookSuggestion(req.body);
    res.status(201).json(suggestion);
  } catch (error) {
    logError(error, req);
    res.status(500).json({ error: 'Failed to create suggestion', details: error.message });
  }
});

// GET /api/books/suggestions
router.get('/', async (req, res) => {
  try {
  const suggestions = await databaseService.getAllBookSuggestions();
    res.json(suggestions);
  } catch (error) {
    logError(error, req);
    res.status(500).json({ error: 'Failed to fetch suggestions', details: error.message });
  }
});

// PATCH /api/books/suggestions/:id
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await databaseService.updateBookSuggestion(id, req.body);
    res.json(updated);
  } catch (error) {
    logError(error, req);
    res.status(500).json({ error: 'Failed to update suggestion', details: error.message });
  }
});

// DELETE /api/books/suggestions/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
  await databaseService.deleteBookSuggestion(Number(id));
    res.status(204).end();
  } catch (error) {
    logError(error, req);
    res.status(500).json({ error: 'Failed to delete suggestion', details: error.message });
  }
});

module.exports = router;
