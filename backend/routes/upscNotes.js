const express = require('express');
const router = express.Router();
const databaseService = require('../services/databaseService');

function isValidNote(data) {
  return data
    && typeof data.topic === 'string'
    && data.topic.trim().length > 0
    && typeof data.content === 'string'
    && data.content.trim().length > 0;
}

router.get('/', async (req, res) => {
  try {
    const notes = await databaseService.getAllUpscNotes();
    res.json({ success: true, data: notes });
  } catch (error) {
    console.error('Error fetching UPSC notes:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch UPSC notes' });
  }
});

router.post('/', async (req, res) => {
  if (!isValidNote(req.body)) {
    return res.status(400).json({ success: false, error: 'Topic and content are required' });
  }

  try {
    const note = await databaseService.createUpscNote(req.body);
    res.status(201).json({ success: true, data: note });
  } catch (error) {
    console.error('Error creating UPSC note:', error);
    res.status(500).json({ success: false, error: 'Failed to create UPSC note' });
  }
});

router.put('/:id', async (req, res) => {
  if (!isValidNote(req.body)) {
    return res.status(400).json({ success: false, error: 'Topic and content are required' });
  }

  try {
    const note = await databaseService.updateUpscNote(req.params.id, req.body);
    res.json({ success: true, data: note });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'UPSC note not found' });
    }
    console.error('Error updating UPSC note:', error);
    res.status(500).json({ success: false, error: 'Failed to update UPSC note' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const note = await databaseService.deleteUpscNote(req.params.id);
    res.json({ success: true, data: note });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'UPSC note not found' });
    }
    console.error('Error deleting UPSC note:', error);
    res.status(500).json({ success: false, error: 'Failed to delete UPSC note' });
  }
});

module.exports = router;
