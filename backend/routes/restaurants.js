const express = require('express');
const router = express.Router();
const databaseService = require('../services/databaseService');

// GET /api/restaurants
router.get('/', async (req, res) => {
  try {
    const restaurants = await databaseService.getAllRestaurants();
    res.json({
      success: true,
      data: restaurants,
      count: restaurants.length
    });
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch restaurants'
    });
  }
});

// GET /api/restaurants/slug/:slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const restaurant = await databaseService.getRestaurantBySlug(req.params.slug);
    
    if (restaurant) {
      res.json({
        success: true,
        data: restaurant
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Restaurant not found'
      });
    }
  } catch (error) {
    console.error('Error fetching restaurant by slug:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch restaurant'
    });
  }
});

// GET /api/restaurants/:id
router.get('/:id', async (req, res) => {
  try {
    const restaurant = await databaseService.getRestaurantById(req.params.id);
    
    if (restaurant) {
      res.json({
        success: true,
        data: restaurant
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Restaurant not found'
      });
    }
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch restaurant'
    });
  }
});

// POST /api/restaurants
router.post('/', async (req, res) => {
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

    const newRestaurant = await databaseService.addRestaurant(restaurantData);
    
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
router.put('/:id', async (req, res) => {
  try {
    const updatedRestaurant = await databaseService.updateRestaurant(req.params.id, req.body);
    
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
    console.error('Error updating restaurant:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update restaurant'
    });
  }
});

// DELETE /api/restaurants/:id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await databaseService.deleteRestaurant(req.params.id);
    
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
    console.error('Error deleting restaurant:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete restaurant'
    });
  }
});

module.exports = router;
