const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const movieRoutes = require('./routes/movies');
const bookRoutes = require('./routes/books');
const tripRoutes = require('./routes/trips');
const restaurantRoutes = require('./routes/restaurants');
const recentRoutes = require('./routes/recent');
const flatRoutes = require('./routes/flats');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());

// Configure CORS for both development and production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      // Add your Vercel domain - replace with your actual domain
      process.env.FRONTEND_URL || 'https://your-app.vercel.app'
    ];
    
    // In production, allow same-origin requests
    if (process.env.NODE_ENV === 'production') {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Personal Blog API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/movies', movieRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/recent', recentRoutes);
app.use('/api/flats', flatRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The route ${req.originalUrl} does not exist on this server`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
