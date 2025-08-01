const express = require('express');
const router = express.Router();
const databaseService = require('../services/databaseService');

// Get all flats
router.get('/', async (req, res) => {
  try {
    const flats = await databaseService.getAllFlats();
    res.json({ success: true, data: flats });
  } catch (error) {
    console.error('Error fetching flats:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch flats' });
  }
});

// Get flat by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const flat = await databaseService.getFlatById(parseInt(id));
    
    if (!flat) {
      return res.status(404).json({ success: false, error: 'Flat not found' });
    }
    
    res.json({ success: true, data: flat });
  } catch (error) {
    console.error('Error fetching flat:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch flat' });
  }
});

// Create new flat
router.post('/', async (req, res) => {
  try {
    const flatData = req.body;
    
    // Validate required fields
    const requiredFields = ['name', 'contactNumber', 'societyName', 'rentValue'];
    const missingFields = requiredFields.filter(field => !flatData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }

    const newFlat = await databaseService.createFlat(flatData);
    res.status(201).json({ success: true, data: newFlat });
  } catch (error) {
    console.error('Error creating flat:', error);
    res.status(500).json({ success: false, error: 'Failed to create flat' });
  }
});

// Update flat
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const flatData = req.body;
    
    const updatedFlat = await databaseService.updateFlat(parseInt(id), flatData);
    
    if (!updatedFlat) {
      return res.status(404).json({ success: false, error: 'Flat not found' });
    }
    
    res.json({ success: true, data: updatedFlat });
  } catch (error) {
    console.error('Error updating flat:', error);
    res.status(500).json({ success: false, error: 'Failed to update flat' });
  }
});

// Delete flat
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedFlat = await databaseService.deleteFlat(parseInt(id));
    
    if (!deletedFlat) {
      return res.status(404).json({ success: false, error: 'Flat not found' });
    }
    
    res.json({ success: true, data: deletedFlat });
  } catch (error) {
    console.error('Error deleting flat:', error);
    res.status(500).json({ success: false, error: 'Failed to delete flat' });
  }
});

module.exports = router;
