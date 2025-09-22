const express = require('express');
const router = express.Router();
const databaseService = require('../services/databaseService');

// GET /api/books
router.get('/', async (req, res) => {
  try {
    const books = await databaseService.getAllBooks();
    res.json({
      success: true,
      data: books,
      count: books.length
    });
    console.log('Books fetched successfully:', books);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch books'
    });
  }
});

// GET /api/books/slug/:slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const book = await databaseService.getBookBySlug(req.params.slug);
    
    if (book) {
      res.json({
        success: true,
        data: book
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }
  } catch (error) {
    console.error('Error fetching book by slug:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch book'
    });
  }
});

// GET /api/books/:id
router.get('/:id', async (req, res) => {
  try {
    const book = await databaseService.getBookById(req.params.id);
    
    if (book) {
      res.json({
        success: true,
        data: book
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Book not found'
      });
    }
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch book'
    });
  }
});

// POST /api/books
router.post('/', async (req, res) => {
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

    const newBook = await databaseService.addBook(bookData);
    
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
    console.error('Error adding book:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add book'
    });
  }
});

// PUT /api/books/:id
router.put('/:id', async (req, res) => {
  try {
    const updatedBook = await databaseService.updateBook(req.params.id, req.body);
    
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
    console.error('Error updating book:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update book'
    });
  }
});

// DELETE /api/books/:id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await databaseService.deleteBook(req.params.id);
    
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
    console.error('Error deleting book:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete book'
    });
  }
});

module.exports = router;
