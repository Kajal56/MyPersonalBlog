import fs from 'fs'
import path from 'path'

const dataDirectory = path.join(process.cwd(), '..', 'data')

// Helper function to read JSON file
export function readJsonFile(filename) {
  try {
    const filePath = path.join(dataDirectory, filename)
    const fileContents = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(fileContents)
  } catch (error) {
    console.error(`Error reading ${filename}:`, error)
    return []
  }
}

// Helper function to write JSON file
export function writeJsonFile(filename, data) {
  try {
    const filePath = path.join(dataDirectory, filename)
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')
    return true
  } catch (error) {
    console.error(`Error writing ${filename}:`, error)
    return false
  }
}

// Generate unique ID
export function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

// Movies CRUD operations
export function getAllMovies() {
  return readJsonFile('movies.json')
}

export function addMovie(movie) {
  const movies = getAllMovies()
  const newMovie = {
    id: generateId(),
    ...movie,
    createdAt: new Date().toISOString()
  }
  movies.push(newMovie)
  writeJsonFile('movies.json', movies)
  return newMovie
}

export function updateMovie(id, updatedMovie) {
  const movies = getAllMovies()
  const index = movies.findIndex(movie => movie.id === id)
  if (index !== -1) {
    movies[index] = { ...movies[index], ...updatedMovie, updatedAt: new Date().toISOString() }
    writeJsonFile('movies.json', movies)
    return movies[index]
  }
  return null
}

export function deleteMovie(id) {
  const movies = getAllMovies()
  const filteredMovies = movies.filter(movie => movie.id !== id)
  writeJsonFile('movies.json', filteredMovies)
  return filteredMovies.length < movies.length
}

// Books CRUD operations
export function getAllBooks() {
  return readJsonFile('books.json')
}

export function addBook(book) {
  const books = getAllBooks()
  const newBook = {
    id: generateId(),
    ...book,
    createdAt: new Date().toISOString()
  }
  books.push(newBook)
  writeJsonFile('books.json', books)
  return newBook
}

export function updateBook(id, updatedBook) {
  const books = getAllBooks()
  const index = books.findIndex(book => book.id === id)
  if (index !== -1) {
    books[index] = { ...books[index], ...updatedBook, updatedAt: new Date().toISOString() }
    writeJsonFile('books.json', books)
    return books[index]
  }
  return null
}

export function deleteBook(id) {
  const books = getAllBooks()
  const filteredBooks = books.filter(book => book.id !== id)
  writeJsonFile('books.json', filteredBooks)
  return filteredBooks.length < books.length
}

// Restaurants CRUD operations
export function getAllRestaurants() {
  return readJsonFile('restaurants.json')
}

export function addRestaurant(restaurant) {
  const restaurants = getAllRestaurants()
  const newRestaurant = {
    id: generateId(),
    ...restaurant,
    createdAt: new Date().toISOString()
  }
  restaurants.push(newRestaurant)
  writeJsonFile('restaurants.json', restaurants)
  return newRestaurant
}

export function updateRestaurant(id, updatedRestaurant) {
  const restaurants = getAllRestaurants()
  const index = restaurants.findIndex(restaurant => restaurant.id === id)
  if (index !== -1) {
    restaurants[index] = { ...restaurants[index], ...updatedRestaurant, updatedAt: new Date().toISOString() }
    writeJsonFile('restaurants.json', restaurants)
    return restaurants[index]
  }
  return null
}

export function deleteRestaurant(id) {
  const restaurants = getAllRestaurants()
  const filteredRestaurants = restaurants.filter(restaurant => restaurant.id !== id)
  writeJsonFile('restaurants.json', filteredRestaurants)
  return filteredRestaurants.length < restaurants.length
}

// Trips CRUD operations
export function getAllTrips() {
  return readJsonFile('trips.json')
}

export function addTrip(trip) {
  const trips = getAllTrips()
  const newTrip = {
    id: generateId(),
    ...trip,
    createdAt: new Date().toISOString()
  }
  trips.push(newTrip)
  writeJsonFile('trips.json', trips)
  return newTrip
}

export function updateTrip(id, updatedTrip) {
  const trips = getAllTrips()
  const index = trips.findIndex(trip => trip.id === id)
  if (index !== -1) {
    trips[index] = { ...trips[index], ...updatedTrip, updatedAt: new Date().toISOString() }
    writeJsonFile('trips.json', trips)
    return trips[index]
  }
  return null
}

export function deleteTrip(id) {
  const trips = getAllTrips()
  const filteredTrips = trips.filter(trip => trip.id !== id)
  writeJsonFile('trips.json', filteredTrips)
  return filteredTrips.length < trips.length
}
