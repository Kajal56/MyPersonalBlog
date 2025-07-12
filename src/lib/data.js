import fs from 'fs'
import path from 'path'

// Check if we're in development or production
const isDevelopment = process.env.NODE_ENV === 'development'

// File-based storage for development
const dataDir = path.join(process.cwd(), 'data')

// In-memory storage for production (Vercel)
let inMemoryData = {
  movies: [
    {
      id: '1',
      title: 'Inception',
      rating: 9,
      favoriteAspect: 'The mind-bending plot and amazing cinematography',
      dateWatched: '2024-12-01',
      tags: ['sci-fi', 'thriller', 'mind-bending'],
      dateAdded: new Date().toISOString()
    }
  ],
  books: [
    {
      id: '1',
      title: 'Atomic Habits',
      author: 'James Clear',
      rating: 8,
      keyTakeaway: 'Small habits compound into remarkable results over time',
      dateRead: '2024-11-15',
      tags: ['self-help', 'productivity', 'habits'],
      dateAdded: new Date().toISOString()
    }
  ],
  trips: [
    {
      id: '1',
      title: 'Weekend in Paris',
      destination: 'Paris, France',
      startDate: '2024-10-15',
      endDate: '2024-10-17',
      highlight: 'Visiting the Eiffel Tower at sunset was magical',
      tags: ['europe', 'city-break', 'culture'],
      dateAdded: new Date().toISOString()
    }
  ],
  restaurants: [
    {
      id: '1',
      name: 'The Local Bistro',
      location: 'Downtown',
      cuisine: 'French',
      rating: 8,
      favoriteDish: 'Coq au Vin',
      dateVisited: '2024-12-05',
      tags: ['french', 'cozy', 'date-night'],
      dateAdded: new Date().toISOString()
    }
  ]
}

// File-based functions for development
const initializeDataFile = (filename, defaultData = []) => {
  if (!isDevelopment) return
  
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
  
  const filePath = path.join(dataDir, filename)
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2))
  }
}

// Initialize all data files in development
if (isDevelopment) {
  ['movies.json', 'books.json', 'trips.json', 'restaurants.json'].forEach(file => {
    initializeDataFile(file)
  })
}

// Generic functions to read and write data
export const readData = (type) => {
  try {
    if (isDevelopment) {
      // Development: read from files
      const filePath = path.join(dataDir, `${type}.json`)
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8')
        return JSON.parse(data)
      }
      return []
    } else {
      // Production: read from memory
      return inMemoryData[type] || []
    }
  } catch (error) {
    console.error(`Error reading ${type} data:`, error)
    return []
  }
}

export const writeData = (type, data) => {
  try {
    if (isDevelopment) {
      // Development: write to files
      const filePath = path.join(dataDir, `${type}.json`)
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
      return true
    } else {
      // Production: write to memory
      inMemoryData[type] = data
      return true
    }
  } catch (error) {
    console.error(`Error writing ${type} data:`, error)
    return false
  }
}

// Get recent entries from all sections
export const getRecentEntries = (limit = 5) => {
  const allEntries = []
  
  const types = ['movies', 'books', 'trips', 'restaurants']
  
  types.forEach(type => {
    const data = readData(type)
    data.forEach(entry => {
      allEntries.push({
        ...entry,
        type
      })
    })
  })
  
  // Sort by dateAdded (newest first)
  allEntries.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
  
  return allEntries.slice(0, limit)
}

// Add new entry
export const addEntry = (type, entry) => {
  const data = readData(type)
  const newEntry = {
    id: Date.now().toString(),
    dateAdded: new Date().toISOString(),
    ...entry
  }
  data.push(newEntry)
  return writeData(type, data)
}

// Update entry
export const updateEntry = (type, id, updatedEntry) => {
  const data = readData(type)
  const index = data.findIndex(entry => entry.id === id)
  if (index !== -1) {
    data[index] = { ...data[index], ...updatedEntry }
    return writeData(type, data)
  }
  return false
}

// Delete entry
export const deleteEntry = (type, id) => {
  const data = readData(type)
  const filteredData = data.filter(entry => entry.id !== id)
  return writeData(type, filteredData)
}
