const express = require('express');
const router = express.Router();
const databaseService = require('../services/databaseService');

// GET /api/trips
router.get('/', async (req, res) => {
  try {
    const trips = await databaseService.getAllTrips();
    res.json({
      success: true,
      data: trips,
      count: trips.length
    });
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trips'
    });
  }
});

// POST /api/trips
router.post('/', async (req, res) => {
  try {
    const { destination, duration, highlights, dateVisited, tags } = req.body;
    
    if (!destination || !duration || !highlights || !dateVisited) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const tripData = {
      destination,
      duration,
      highlights,
      dateVisited,
      tags: tags || []
    };

    const newTrip = await databaseService.addTrip(tripData);
    
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
    console.error('Error adding trip:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add trip'
    });
  }
});

// PUT /api/trips/:id
router.put('/:id', async (req, res) => {
  try {
    const updatedTrip = await databaseService.updateTrip(req.params.id, req.body);
    
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
    console.error('Error updating trip:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update trip'
    });
  }
});

// DELETE /api/trips/:id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await databaseService.deleteTrip(req.params.id);
    
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
    console.error('Error deleting trip:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete trip'
    });
  }
});

module.exports = router;
