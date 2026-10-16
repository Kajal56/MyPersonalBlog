# Personal Blog - Separated Frontend & Backend

A modern personal blog application with separated frontend and backend architecture.

## 🏗️ Architecture

```
Personal Blog
├── backend/          # Node.js/Express API Server
│   ├── routes/       # API route handlers
│   ├── services/     # Business logic
│   ├── data/         # JSON data storage
│   └── server.js     # Main server file
├── frontend/         # Next.js React Application
│   ├── src/          # Source code
│   ├── services/     # API communication
│   └── pages/        # Frontend pages
└── scripts/          # Development scripts
```

## 🚀 Quick Start

### Option 1: Start Both Services (Recommended)
```bash
# Windows
./start-dev.bat

# Linux/Mac
chmod +x start-dev.sh
./start-dev.sh
```

### Option 2: Start Manually

**Backend (Terminal 1):**
```bash
cd backend
npm install
npm run dev
# Runs on http://localhost:5000
```

**Frontend (Terminal 2):**
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

## 📡 API Endpoints

### Base URL: `http://localhost:5000/api`

#### Movies
- `GET /movies` - Get all movies
- `POST /movies` - Add new movie
- `PUT /movies/:id` - Update movie
- `DELETE /movies/:id` - Delete movie

#### Books
- `GET /books` - Get all books
- `POST /books` - Add new book
- `PUT /books/:id` - Update book
- `DELETE /books/:id` - Delete book

#### Trips
- `GET /trips` - Get all trips
- `POST /trips` - Add new trip
- `PUT /trips/:id` - Update trip
- `DELETE /trips/:id` - Delete trip

#### Restaurants
- `GET /restaurants` - Get all restaurants
- `POST /restaurants` - Add new restaurant
- `PUT /restaurants/:id` - Update restaurant
- `DELETE /restaurants/:id` - Delete restaurant

#### UPSC Notes
- `GET /upsc-notes` - Get all UPSC notes
- `POST /upsc-notes` - Add a topic and its note content
- `PUT /upsc-notes/:id` - Update a UPSC note
- `DELETE /upsc-notes/:id` - Delete a UPSC note

#### Health Check
- `GET /health` - API health status

## 🔧 Configuration

### Backend (.env)
```
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 📊 Data Flow

```
Frontend (React) → API Service → Backend (Express) → Data Service → JSON Files
```

1. **Frontend** sends requests via ApiService
2. **ApiService** handles HTTP communication
3. **Backend routes** receive and validate requests
4. **DataService** manages file operations
5. **JSON files** store the actual data

## 🛠️ Development

### Backend Structure
```
backend/
├── server.js          # Express server setup
├── routes/
│   ├── movies.js       # Movie CRUD operations
│   ├── books.js        # Book CRUD operations
│   ├── trips.js        # Trip CRUD operations
│   └── restaurants.js  # Restaurant CRUD operations
├── services/
│   └── dataService.js  # Data management logic
└── data/               # JSON storage files
```

### Frontend Structure
```
frontend/
├── src/
│   ├── app/            # Next.js app directory
│   ├── components/     # React components
│   └── services/       # API communication
└── public/             # Static assets
```

## 🚦 Testing API

### Using curl:
```bash
# Get all movies
curl http://localhost:5000/api/movies

# Add a movie
curl -X POST http://localhost:5000/api/movies \
  -H "Content-Type: application/json" \
  -d '{"title":"Inception","rating":9,"favoriteAspect":"Mind-bending","dateWatched":"2024-01-01"}'

# Health check
curl http://localhost:5000/health
```

### Using browser:
- Visit `http://localhost:5000/health` for backend health
- Visit `http://localhost:3000` for frontend

## 🔄 Migration from Monolithic

The original Next.js application has been split into:

**Backend Benefits:**
- ✅ Dedicated API server
- ✅ Better error handling
- ✅ Proper REST endpoints
- ✅ Scalable architecture
- ✅ Easy to deploy separately

**Frontend Benefits:**
- ✅ Pure React UI
- ✅ Centralized API communication
- ✅ Better separation of concerns
- ✅ Easier testing

## 🚀 Deployment

### Backend
- Deploy to Railway, Heroku, or DigitalOcean
- Set environment variables
- Upgrade to proper database (PostgreSQL/MongoDB)

### Frontend
- Deploy to Vercel (recommended)
- Update `NEXT_PUBLIC_API_URL` to backend URL
- Configure CORS on backend

## 🔮 Next Steps

1. **Database Integration**: Replace JSON files with PostgreSQL or MongoDB
2. **Authentication**: Add JWT-based user authentication
3. **File Upload**: Add image upload for trips/restaurants
4. **Search**: Implement search across all sections
5. **Analytics**: Add usage tracking
6. **Caching**: Implement Redis caching
7. **Testing**: Add unit and integration tests

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Lint code

Your blog is now properly separated and ready for production scaling! 🎉
