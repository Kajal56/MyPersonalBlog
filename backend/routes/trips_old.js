const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');

// GET /api/trips
router.get('/', (req, res) => {
  try {
    const trips = dataService.getAllEntries('trips');
    res.json({
      success: true,
      data: trips,
      count: trips.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trips'
    });
  }
});

// POST /api/trips
router.post('/', (req, res) => {
  try {
    const { title, destination, startDate, endDate, highlight, tags } = req.body;
    
    if (!title || !destination || !startDate || !endDate || !highlight) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const tripData = {
      title,
      destination,
      startDate,
      endDate,
      highlight,
      tags: tags || []
    };

    const newTrip = dataService.addEntry('trips', tripData);
    
    if (newTrip) {
      res.status(201).json({
        success: true,
        data: newTrip
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to add trip'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to add trip'
    });
  }
});

// PUT /api/trips/:id
router.put('/:id', (req, res) => {
  try {
    const updatedTrip = dataService.updateEntry('trips', req.params.id, req.body);
    
    if (updatedTrip) {
      res.json({
        success: true,
        data: updatedTrip
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Trip not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update trip'
    });
  }
});

// DELETE /api/trips/:id
router.delete('/:id', (req, res) => {
  try {
    const deleted = dataService.deleteEntry('trips', req.params.id);
    
    if (deleted) {
      res.json({
        success: true,
        message: 'Trip deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Trip not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete trip'
    });
  }
});

module.exports = router;
