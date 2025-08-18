const express = require('express');
const router = express.Router();
const databaseService = require('../services/databaseService');

// POST /api/contact/messages
router.post('/', async (req, res) => {
  try {
    const message = await databaseService.addContactMessage(req.body);
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save contact message', details: error.message });
  }
});

// GET /api/contact/messages
router.get('/', async (req, res) => {
  try {
    const messages = await databaseService.getAllContactMessages();
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch contact messages', details: error.message });
  }
});

module.exports = router;
