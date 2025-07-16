const express = require('express');
const router = express.Router();
const databaseService = require('../services/databaseService');

// GET /api/movies - Get all movies
router.get('/', (req, res) => {
  try {
    const movies = dataService.getAllEntries('movies');
    res.json({
      success: true,
      data: movies,
      count: movies.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch movies'
    });
  }
});

// GET /api/movies/:id - Get movie by ID
router.get('/:id', (req, res) => {
  try {
    const movie = dataService.getEntryById('movies', req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        error: 'Movie not found'
      });
    }
    res.json({
      success: true,
      data: movie
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch movie'
    });
  }
});

// POST /api/movies - Add new movie
router.post('/', (req, res) => {
  try {
    const { title, rating, favoriteAspect, dateWatched, tags } = req.body;
    
    // Validation
    if (!title || !rating || !favoriteAspect || !dateWatched) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, rating, favoriteAspect, dateWatched'
      });
    }

    if (rating < 1 || rating > 10) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 10'
      });
    }

    const movieData = {
      title,
      rating: parseInt(rating),
      favoriteAspect,
      dateWatched,
      tags: tags || []
    };

    const newMovie = dataService.addEntry('movies', movieData);
    
    if (newMovie) {
      res.status(201).json({
        success: true,
        data: newMovie,
        message: 'Movie added successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to add movie'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to add movie'
    });
  }
});

// PUT /api/movies/:id - Update movie
router.put('/:id', (req, res) => {
  try {
    const updatedMovie = dataService.updateEntry('movies', req.params.id, req.body);
    
    if (updatedMovie) {
      res.json({
        success: true,
        data: updatedMovie,
        message: 'Movie updated successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Movie not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update movie'
    });
  }
});

// DELETE /api/movies/:id - Delete movie
router.delete('/:id', (req, res) => {
  try {
    const deleted = dataService.deleteEntry('movies', req.params.id);
    
    if (deleted) {
      res.json({
        success: true,
        message: 'Movie deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Movie not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete movie'
    });
  }
});

module.exports = router;
