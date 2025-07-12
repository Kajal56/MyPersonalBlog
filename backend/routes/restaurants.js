const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');

// GET /api/restaurants
router.get('/', (req, res) => {
  try {
    const restaurants = dataService.getAllEntries('restaurants');
    res.json({
      success: true,
      data: restaurants,
      count: restaurants.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch restaurants'
    });
  }
});

// POST /api/restaurants
router.post('/', (req, res) => {
  try {
    const { name, location, cuisine, rating, favoriteDish, dateVisited, tags } = req.body;
    
    if (!name || !location || !cuisine || !rating || !favoriteDish || !dateVisited) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const restaurantData = {
      name,
      location,
      cuisine,
      rating: parseInt(rating),
      favoriteDish,
      dateVisited,
      tags: tags || []
    };

    const newRestaurant = dataService.addEntry('restaurants', restaurantData);
    
    if (newRestaurant) {
      res.status(201).json({
        success: true,
        data: newRestaurant
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to add restaurant'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to add restaurant'
    });
  }
});

// PUT /api/restaurants/:id
router.put('/:id', (req, res) => {
  try {
    const updatedRestaurant = dataService.updateEntry('restaurants', req.params.id, req.body);
    
    if (updatedRestaurant) {
      res.json({
        success: true,
        data: updatedRestaurant
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Restaurant not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update restaurant'
    });
  }
});

// DELETE /api/restaurants/:id
router.delete('/:id', (req, res) => {
  try {
    const deleted = dataService.deleteEntry('restaurants', req.params.id);
    
    if (deleted) {
      res.json({
        success: true,
        message: 'Restaurant deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Restaurant not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete restaurant'
    });
  }
});

module.exports = router;
