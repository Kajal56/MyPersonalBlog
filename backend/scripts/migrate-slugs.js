const { PrismaClient } = require('@prisma/client');
const { generateUniqueSlug } = require('../utils/slugify');

const prisma = new PrismaClient();

async function migrateToSlugs() {
  console.log('Starting slug migration...');

  try {
    // Migrate Movies
    console.log('Migrating movies...');
    const movies = await prisma.movie.findMany({
      where: { slug: null }
    });
    
    const existingMovieSlugs = (await prisma.movie.findMany({
      where: { slug: { not: null } },
      select: { slug: true }
    })).map(m => m.slug);

    for (const movie of movies) {
      const slug = generateUniqueSlug(movie.title, existingMovieSlugs);
      await prisma.movie.update({
        where: { id: movie.id },
        data: { slug }
      });
      existingMovieSlugs.push(slug);
      console.log(`✓ Updated movie: ${movie.title} -> ${slug}`);
    }

    // Migrate Books
    console.log('Migrating books...');
    const books = await prisma.book.findMany({
      where: { slug: null }
    });
    
    const existingBookSlugs = (await prisma.book.findMany({
      where: { slug: { not: null } },
      select: { slug: true }
    })).map(b => b.slug);

    for (const book of books) {
      const slug = generateUniqueSlug(book.title, existingBookSlugs);
      await prisma.book.update({
        where: { id: book.id },
        data: { slug }
      });
      existingBookSlugs.push(slug);
      console.log(`✓ Updated book: ${book.title} -> ${slug}`);
    }

    // Migrate Trips
    console.log('Migrating trips...');
    const trips = await prisma.trip.findMany({
      where: { slug: null }
    });
    
    const existingTripSlugs = (await prisma.trip.findMany({
      where: { slug: { not: null } },
      select: { slug: true }
    })).map(t => t.slug);

    for (const trip of trips) {
      const slug = generateUniqueSlug(trip.title, existingTripSlugs);
      await prisma.trip.update({
        where: { id: trip.id },
        data: { slug }
      });
      existingTripSlugs.push(slug);
      console.log(`✓ Updated trip: ${trip.title} -> ${slug}`);
    }

    // Migrate Restaurants
    console.log('Migrating restaurants...');
    const restaurants = await prisma.restaurant.findMany({
      where: { slug: null }
    });
    
    const existingRestaurantSlugs = (await prisma.restaurant.findMany({
      where: { slug: { not: null } },
      select: { slug: true }
    })).map(r => r.slug);

    for (const restaurant of restaurants) {
      const slug = generateUniqueSlug(restaurant.name, existingRestaurantSlugs);
      await prisma.restaurant.update({
        where: { id: restaurant.id },
        data: { slug }
      });
      existingRestaurantSlugs.push(slug);
      console.log(`✓ Updated restaurant: ${restaurant.name} -> ${slug}`);
    }

    console.log('Slug migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateToSlugs();
