-- CreateTable
CREATE TABLE "movies" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "favoriteAspect" TEXT NOT NULL,
    "dateWatched" TIMESTAMP(3) NOT NULL,
    "tags" TEXT[],
    "dateAdded" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "books" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "keyTakeaway" TEXT NOT NULL,
    "dateRead" TIMESTAMP(3) NOT NULL,
    "tags" TEXT[],
    "dateAdded" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "books_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trips" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "highlight" TEXT NOT NULL,
    "tags" TEXT[],
    "dateAdded" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "cuisine" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "favoriteDish" TEXT NOT NULL,
    "dateVisited" TIMESTAMP(3) NOT NULL,
    "tags" TEXT[],
    "dateAdded" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "restaurants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flats" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "societyName" TEXT NOT NULL,
    "googleMapsLink" TEXT,
    "rentValue" INTEGER NOT NULL,
    "remarks" TEXT,
    "dateAdded" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "flats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feed_posts" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "mediaType" TEXT,
    "mediaData" TEXT,
    "tags" TEXT[],
    "dateAdded" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feed_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "book_suggestions" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "itemName" TEXT,
    "message" TEXT NOT NULL,
    "moment" TEXT,
    "dateSuggested" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isRead" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "book_suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movie_suggestions" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "itemName" TEXT,
    "message" TEXT NOT NULL,
    "moment" TEXT,
    "dateSuggested" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isRead" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "movie_suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant_suggestions" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "itemName" TEXT,
    "message" TEXT NOT NULL,
    "moment" TEXT,
    "dateSuggested" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isRead" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "restaurant_suggestions_pkey" PRIMARY KEY ("id")
);

