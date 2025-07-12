// Frontend API service to communicate with backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      // If the response has a 'data' property, return that, otherwise return the full response
      return result.data !== undefined ? result.data : result;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Generic CRUD operations
  async getAll(type) {
    return this.request(`/${type}`);
  }

  async getById(type, id) {
    return this.request(`/${type}/${id}`);
  }

  async create(type, data) {
    return this.request(`/${type}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update(type, id, data) {
    return this.request(`/${type}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(type, id) {
    return this.request(`/${type}/${id}`, {
      method: 'DELETE',
    });
  }

  // Recent entries
  async getRecentEntries(limit = 5) {
    return this.request(`/recent?limit=${limit}`);
  }

  // Movies
  async getAllMovies() {
    return this.getAll('movies');
  }

  async createMovie(movieData) {
    return this.create('movies', movieData);
  }

  async updateMovie(id, movieData) {
    return this.update('movies', id, movieData);
  }

  async deleteMovie(id) {
    return this.delete('movies', id);
  }

  // Books
  async getAllBooks() {
    return this.getAll('books');
  }

  async createBook(bookData) {
    return this.create('books', bookData);
  }

  async updateBook(id, bookData) {
    return this.update('books', id, bookData);
  }

  async deleteBook(id) {
    return this.delete('books', id);
  }

  // Trips
  async getAllTrips() {
    return this.getAll('trips');
  }

  async createTrip(tripData) {
    return this.create('trips', tripData);
  }

  async updateTrip(id, tripData) {
    return this.update('trips', id, tripData);
  }

  async deleteTrip(id) {
    return this.delete('trips', id);
  }

  // Restaurants
  async getAllRestaurants() {
    return this.getAll('restaurants');
  }

  async createRestaurant(restaurantData) {
    return this.create('restaurants', restaurantData);
  }

  async updateRestaurant(id, restaurantData) {
    return this.update('restaurants', id, restaurantData);
  }

  async deleteRestaurant(id) {
    return this.delete('restaurants', id);
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export const apiService = new ApiService();
