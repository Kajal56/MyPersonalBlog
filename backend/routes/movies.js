const express = require('express');
const router = express.Router();
const databaseService = require('../services/databaseService');

// GET /api/movies
router.get('/', async (req, res) => {
  try {
    const movies = await databaseService.getAllMovies();
    res.json({
      success: true,
      data: movies,
      count: movies.length
    });
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch movies'
    });
  }
});

// GET /api/movies/slug/:slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const movie = await databaseService.getMovieBySlug(req.params.slug);
    
    if (movie) {
      res.json({
        success: true,
        data: movie
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Movie not found'
      });
    }
  } catch (error) {
    console.error('Error fetching movie by slug:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch movie'
    });
  }
});

// GET /api/movies/:id
router.get('/:id', async (req, res) => {
  try {
    const movie = await databaseService.getMovieById(req.params.id);
    
    if (movie) {
      res.json({
        success: true,
        data: movie
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Movie not found'
      });
    }
  } catch (error) {
    console.error('Error fetching movie:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch movie'
    });
  }
});

// POST /api/movies
router.post('/', async (req, res) => {
  try {
    const { title, rating, favoriteAspect, dateWatched, tags } = req.body;
    
    if (!title || !rating || !favoriteAspect || !dateWatched) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const movieData = {
      title,
      rating: parseInt(rating),
      favoriteAspect,
      dateWatched,
      tags: tags || []
    };

    const newMovie = await databaseService.addMovie(movieData);
    
    if (newMovie) {
      res.status(201).json({
        success: true,
        data: newMovie
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to add movie'
      });
    }
  } catch (error) {
    console.error('Error adding movie:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add movie'
    });
  }
});

// PUT /api/movies/:id
router.put('/:id', async (req, res) => {
  try {
    const updatedMovie = await databaseService.updateMovie(req.params.id, req.body);
    
    if (updatedMovie) {
      res.json({
        success: true,
        data: updatedMovie
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Movie not found'
      });
    }
  } catch (error) {
    console.error('Error updating movie:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update movie'
    });
  }
});

// DELETE /api/movies/:id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await databaseService.deleteMovie(req.params.id);
    
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
    console.error('Error deleting movie:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete movie'
    });
  }
});

module.exports = router;
