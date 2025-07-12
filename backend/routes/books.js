const express = require('express');
const router = express.Router();
const dataService = require('../services/dataService');

// GET /api/books
router.get('/', (req, res) => {
  try {
    const books = dataService.getAllEntries('books');
    res.json({
      success: true,
      data: books,
      count: books.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch books'
    });
  }
});

// POST /api/books
router.post('/', (req, res) => {
  try {
    const { title, author, rating, keyTakeaway, dateRead, tags } = req.body;
    
    if (!title || !author || !rating || !keyTakeaway || !dateRead) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const bookData = {
      title,
      author,
      rating: parseInt(rating),
      keyTakeaway,
      dateRead,
      tags: tags || []
    };

    const newBook = dataService.addEntry('books', bookData);
    
    if (newBook) {
      res.status(201).json({
        success: true,
        data: newBook
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to add book'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to add book'
    });
  }
});

// PUT /api/books/:id
router.put('/:id', (req, res) => {
  try {
    const updatedBook = dataService.updateEntry('books', req.params.id, req.body);
    
    if (updatedBook) {
      res.json({
        success: true,
        data: updatedBook
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update book'
    });
  }
});

// DELETE /api/books/:id
router.delete('/:id', (req, res) => {
  try {
    const deleted = dataService.deleteEntry('books', req.params.id);
    
    if (deleted) {
      res.json({
        success: true,
        message: 'Book deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete book'
    });
  }
});

module.exports = router;
