import fs from 'fs'
import path from 'path'

const dataDir = path.join(process.cwd(), 'data')

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

// Initialize empty data files if they don't exist
const initializeDataFile = (filename, defaultData = []) => {
  const filePath = path.join(dataDir, filename)
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2))
  }
}

// Initialize all data files
['movies.json', 'books.json', 'trips.json', 'restaurants.json'].forEach(file => {
  initializeDataFile(file)
})

// Generic functions to read and write data
export const readData = (type) => {
  try {
    const filePath = path.join(dataDir, `${type}.json`)
    const data = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error(`Error reading ${type} data:`, error)
    return []
  }
}

export const writeData = (type, data) => {
  try {
    const filePath = path.join(dataDir, `${type}.json`)
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
    return true
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
