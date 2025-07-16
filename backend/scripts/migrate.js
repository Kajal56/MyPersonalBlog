const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function migrateJsonToDatabase() {
  console.log('🚀 Starting migration from JSON files to PostgreSQL database...');

  try {
    // Read existing JSON data
    const dataDir = path.join(__dirname, '../data');
    
    const moviesData = JSON.parse(fs.readFileSync(path.join(dataDir, 'movies.json'), 'utf8'));
    const booksData = JSON.parse(fs.readFileSync(path.join(dataDir, 'books.json'), 'utf8'));
    const tripsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'trips.json'), 'utf8'));
    const restaurantsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'restaurants.json'), 'utf8'));

    console.log(`📚 Found ${moviesData.length} movies, ${booksData.length} books, ${tripsData.length} trips, ${restaurantsData.length} restaurants`);

    // Migrate Movies
    for (const movie of moviesData) {
      await prisma.movie.upsert({
        where: { id: movie.id },
        update: {},
        create: {
          id: movie.id,
          title: movie.title,
          rating: parseInt(movie.rating),
          favoriteAspect: movie.favoriteAspect,
          dateWatched: new Date(movie.dateWatched),
          tags: movie.tags || [],
          dateAdded: new Date(movie.dateAdded)
        }
      });
    }
    console.log('✅ Movies migrated successfully');

    // Migrate Books
    for (const book of booksData) {
      await prisma.book.create({
        data: {
          id: book.id,
          title: book.title,
          author: book.author,
          rating: parseInt(book.rating),
          keyTakeaway: book.keyTakeaway,
          dateRead: new Date(book.dateRead),
          tags: book.tags || [],
          dateAdded: new Date(book.dateAdded)
        }
      });
    }
    console.log('✅ Books migrated successfully');

    // Migrate Trips
    for (const trip of tripsData) {
      await prisma.trip.create({
        data: {
          id: trip.id,
          title: trip.title,
          destination: trip.destination,
          startDate: new Date(trip.startDate),
          endDate: new Date(trip.endDate),
          highlight: trip.highlight,
          tags: trip.tags || [],
          dateAdded: new Date(trip.dateAdded)
        }
      });
    }
    console.log('✅ Trips migrated successfully');

    // Migrate Restaurants
    for (const restaurant of restaurantsData) {
      await prisma.restaurant.create({
        data: {
          id: restaurant.id,
          name: restaurant.name,
          location: restaurant.location,
          cuisine: restaurant.cuisine,
          rating: parseInt(restaurant.rating),
          favoriteDish: restaurant.favoriteDish,
          dateVisited: new Date(restaurant.dateVisited),
          tags: restaurant.tags || [],
          dateAdded: new Date(restaurant.dateAdded)
        }
      });
    }
    console.log('✅ Restaurants migrated successfully');

    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateJsonToDatabase()
    .then(() => {
      console.log('Migration finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateJsonToDatabase };
