const fs = require('fs');
const path = require('path');

class DataService {
  constructor() {
    this.dataDir = path.join(__dirname, '../data');
    this.ensureDataDirectory();
    this.initializeDataFiles();
  }

  ensureDataDirectory() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  initializeDataFiles() {
    const files = ['movies.json', 'books.json', 'trips.json', 'restaurants.json'];
    files.forEach(file => {
      const filePath = path.join(this.dataDir, file);
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify([], null, 2));
      }
    });
  }

  readData(type) {
    try {
      const filePath = path.join(this.dataDir, `${type}.json`);
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading ${type} data:`, error);
      return [];
    }
  }

  writeData(type, data) {
    try {
      const filePath = path.join(this.dataDir, `${type}.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error(`Error writing ${type} data:`, error);
      return false;
    }
  }

  getAllEntries(type) {
    return this.readData(type);
  }

  getEntryById(type, id) {
    const data = this.readData(type);
    return data.find(entry => entry.id === id);
  }

  addEntry(type, entry) {
    const data = this.readData(type);
    const newEntry = {
      id: Date.now().toString(),
      dateAdded: new Date().toISOString(),
      ...entry
    };
    data.push(newEntry);
    
    if (this.writeData(type, data)) {
      return newEntry;
    }
    return null;
  }

  updateEntry(type, id, updatedEntry) {
    const data = this.readData(type);
    const index = data.findIndex(entry => entry.id === id);
    
    if (index !== -1) {
      data[index] = { 
        ...data[index], 
        ...updatedEntry,
        dateUpdated: new Date().toISOString()
      };
      
      if (this.writeData(type, data)) {
        return data[index];
      }
    }
    return null;
  }

  deleteEntry(type, id) {
    const data = this.readData(type);
    const initialLength = data.length;
    const filteredData = data.filter(entry => entry.id !== id);
    
    if (filteredData.length < initialLength) {
      return this.writeData(type, filteredData);
    }
    return false;
  }

  getRecentEntries(limit = 5) {
    const allEntries = [];
    const types = ['movies', 'books', 'trips', 'restaurants'];
    
    types.forEach(type => {
      const data = this.readData(type);
      data.forEach(entry => {
        allEntries.push({
          ...entry,
          type
        });
      });
    });
    
    // Sort by dateAdded (newest first)
    allEntries.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
    
    return allEntries.slice(0, limit);
  }

  searchEntries(type, query) {
    const data = this.readData(type);
    const searchTerm = query.toLowerCase();
    
    return data.filter(entry => {
      const searchableFields = Object.values(entry)
        .filter(value => typeof value === 'string')
        .join(' ')
        .toLowerCase();
      
      return searchableFields.includes(searchTerm);
    });
  }
}

module.exports = new DataService();
