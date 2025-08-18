const { PrismaClient } = require('@prisma/client');

// Global variable to reuse the Prisma instance in serverless environments
let prisma;

class DatabaseService {
  // Movie Suggestions
  async getAllMovieSuggestions() {
    return this.prisma.movieSuggestion.findMany({
      orderBy: { dateSuggested: 'desc' }
    });
  }

  async getMovieSuggestionById(id) {
    return this.prisma.movieSuggestion.findUnique({
      where: { id }
    });
  }

  async addMovieSuggestion(data) {
    return this.prisma.movieSuggestion.create({
      data: {
        name: data.name || null,
        itemName: data.itemName || null,
        message: data.message || '',
        moment: data.moment || null,
        dateSuggested: data.dateSuggested ? new Date(data.dateSuggested) : new Date(),
        isRead: data.isRead || false
      }
    });
  }

  async updateMovieSuggestion(id, data) {
    return this.prisma.movieSuggestion.update({
      where: { id },
      data: {
        name: data.name,
        itemName: data.itemName,
        message: data.message,
        moment: data.moment,
        dateSuggested: data.dateSuggested ? new Date(data.dateSuggested) : undefined,
        isRead: typeof data.isRead === 'boolean' ? data.isRead : undefined
      }
    });
  }

  async deleteMovieSuggestion(id) {
    return this.prisma.movieSuggestion.delete({
      where: { id }
    });
  }

  constructor() {
    // Reuse existing Prisma instance in serverless environments
    if (!prisma) {
      prisma = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      });
    }
    this.prisma = prisma;
  }

  // Cleanup method for graceful shutdown
  async disconnect() {
    await this.prisma.$disconnect();
  }

  // Movies
  async getAllMovies() {
    return this.prisma.movie.findMany({
      orderBy: { dateAdded: 'desc' }
    });
  }

  async getMovieById(id) {
    return this.prisma.movie.findUnique({
      where: { id }
    });
  }

  async addMovie(data) {
    return this.prisma.movie.create({
      data: {
        title: data.title,
        rating: parseInt(data.rating),
        favoriteAspect: data.favoriteAspect,
        dateWatched: new Date(data.dateWatched),
        tags: data.tags || []
      }
    });
  }

  async updateMovie(id, data) {
    return this.prisma.movie.update({
      where: { id },
      data: {
        title: data.title,
        rating: parseInt(data.rating),
        favoriteAspect: data.favoriteAspect,
        dateWatched: new Date(data.dateWatched),
        tags: data.tags || []
      }
    });
  }

  async deleteMovie(id) {
    return this.prisma.movie.delete({
      where: { id }
    });
  }

  // Books
  async getAllBooks() {
    return this.prisma.book.findMany({
      orderBy: { dateAdded: 'desc' }
    });
  }

  async getBookById(id) {
    return this.prisma.book.findUnique({
      where: { id }
    });
  }

  async addBook(data) {
    return this.prisma.book.create({
      data: {
        title: data.title,
        author: data.author,
        rating: parseInt(data.rating),
        keyTakeaway: data.keyTakeaway,
        dateRead: new Date(data.dateRead),
        tags: data.tags || []
      }
    });
  }

  async updateBook(id, data) {
    return this.prisma.book.update({
      where: { id },
      data: {
        title: data.title,
        author: data.author,
        rating: parseInt(data.rating),
        keyTakeaway: data.keyTakeaway,
        dateRead: new Date(data.dateRead),
        tags: data.tags || []
      }
    });
  }

  async deleteBook(id) {
    return this.prisma.book.delete({
      where: { id }
    });
  }

  // Book Suggestions
  async getAllBookSuggestions() {
    return this.prisma.bookSuggestion.findMany({
      orderBy: { dateSuggested: 'desc' }
    });
  }

  async getBookSuggestionById(id) {
    return this.prisma.bookSuggestion.findUnique({
      where: { id }
    });
  }

  async addBookSuggestion(data) {
    return this.prisma.bookSuggestion.create({
      data: {
        name: data.name || null,
        itemName: data.itemName || null,
        message: data.message || '',
        moment: data.moment || null,
        dateSuggested: data.dateSuggested ? new Date(data.dateSuggested) : new Date(),
        isRead: data.isRead || false
      }
    });
  }

  async updateBookSuggestion(id, data) {
    return this.prisma.bookSuggestion.update({
      where: { id },
      data: {
        name: data.name,
        itemName: data.itemName,
        message: data.message,
        moment: data.moment,
        dateSuggested: data.dateSuggested ? new Date(data.dateSuggested) : undefined,
        isRead: typeof data.isRead === 'boolean' ? data.isRead : undefined
      }
    });
  }

  async deleteBookSuggestion(id) {
    return this.prisma.bookSuggestion.delete({
      where: { id }
    });
  }

  // Trips
  async getAllTrips() {
    return this.prisma.trip.findMany({
      orderBy: { dateAdded: 'desc' }
    });
  }

  async getTripById(id) {
    return this.prisma.trip.findUnique({
      where: { id }
    });
  }

  async addTrip(data) {
    return this.prisma.trip.create({
      data: {
        title: data.title,
        destination: data.destination,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        highlight: data.highlight,
        tags: data.tags || []
      }
    });
  }

  async updateTrip(id, data) {
    return this.prisma.trip.update({
      where: { id },
      data: {
        title: data.title,
        destination: data.destination,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        highlight: data.highlight,
        tags: data.tags || []
      }
    });
  }

  async deleteTrip(id) {
    return this.prisma.trip.delete({
      where: { id }
    });
  }

  // Restaurants
  async getAllRestaurants() {
    return this.prisma.restaurant.findMany({
      orderBy: { dateAdded: 'desc' }
    });
  }

  async getRestaurantById(id) {
    return this.prisma.restaurant.findUnique({
      where: { id }
    });
  }

  async addRestaurant(data) {
    return this.prisma.restaurant.create({
      data: {
        name: data.name,
        location: data.location,
        cuisine: data.cuisine,
        rating: parseInt(data.rating),
        favoriteDish: data.favoriteDish,
        dateVisited: new Date(data.dateVisited),
        tags: data.tags || []
      }
    });
  }

  async updateRestaurant(id, data) {
    return this.prisma.restaurant.update({
      where: { id },
      data: {
        name: data.name,
        location: data.location,
        cuisine: data.cuisine,
        rating: parseInt(data.rating),
        favoriteDish: data.favoriteDish,
        dateVisited: new Date(data.dateVisited),
        tags: data.tags || []
      }
    });
  }

  async deleteRestaurant(id) {
    return this.prisma.restaurant.delete({
      where: { id }
    });
  }

  // Recent entries across all types
  async getRecentEntries(limit = 5) {
    const [movies, books, trips, restaurants] = await Promise.all([
      this.prisma.movie.findMany({
        take: limit,
        orderBy: { dateAdded: 'desc' },
        select: { id: true, title: true, dateAdded: true }
      }),
      this.prisma.book.findMany({
        take: limit,
        orderBy: { dateAdded: 'desc' },
        select: { id: true, title: true, dateAdded: true }
      }),
      this.prisma.trip.findMany({
        take: limit,
        orderBy: { dateAdded: 'desc' },
        select: { id: true, title: true, dateAdded: true }
      }),
      this.prisma.restaurant.findMany({
        take: limit,
        orderBy: { dateAdded: 'desc' },
        select: { id: true, name: true, dateAdded: true }
      })
    ]);

    const allEntries = [
      ...movies.map(item => ({ ...item, type: 'movies' })),
      ...books.map(item => ({ ...item, type: 'books' })),
      ...trips.map(item => ({ ...item, type: 'trips' })),
      ...restaurants.map(item => ({ ...item, title: item.name, type: 'restaurants' }))
    ];

    return allEntries
      .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
      .slice(0, limit);
  }

  // Flats
  async getAllFlats() {
    return this.prisma.flat.findMany({
      orderBy: { dateAdded: 'desc' }
    });
  }

  async getFlatById(id) {
    return this.prisma.flat.findUnique({
      where: { id }
    });
  }

  async createFlat(data) {
    return this.prisma.flat.create({
      data: {
        name: data.name,
        contactNumber: data.contactNumber,
        societyName: data.societyName,
        googleMapsLink: data.googleMapsLink || null,
        rentValue: parseInt(data.rentValue),
        remarks: data.remarks || null
      }
    });
  }

  async updateFlat(id, data) {
    return this.prisma.flat.update({
      where: { id },
      data: {
        name: data.name,
        contactNumber: data.contactNumber,
        societyName: data.societyName,
        googleMapsLink: data.googleMapsLink || null,
        rentValue: parseInt(data.rentValue),
        remarks: data.remarks || null
      }
    });
  }

  async deleteFlat(id) {
    return this.prisma.flat.delete({
      where: { id }
    });
  }

  // Feed Posts
  async getAllFeedPosts() {
    return this.prisma.feedPost.findMany({
      orderBy: { dateAdded: 'desc' }
    });
  }

  async getFeedPostById(id) {
    return this.prisma.feedPost.findUnique({
      where: { id }
    });
  }

  async createFeedPost(data) {
    return this.prisma.feedPost.create({
      data: {
        title: data.title || null,
        content: data.content,
        mediaType: data.mediaType || null,
        mediaData: data.mediaData || null,
        tags: data.tags || []
      }
    });
  }

  async updateFeedPost(id, data) {
    return this.prisma.feedPost.update({
      where: { id },
      data: {
        title: data.title || null,
        content: data.content,
        mediaType: data.mediaType || null,
        mediaData: data.mediaData || null,
        tags: data.tags || []
      }
    });
  }

  async deleteFeedPost(id) {
    return this.prisma.feedPost.delete({
      where: { id }
    });
  }

  // Clean up connections
  async disconnect() {
    await this.prisma.$disconnect();
  }
}

module.exports = new DatabaseService();
