# Personal Blog - Separated Architecture

> **Note**: This project has been restructured into separate frontend and backend services.
> See `README-SEPARATED.md` for detailed instructions.

## � Quick Start

### Prerequisites
- Node.js 18+ installed

### Run Both Services
```bash
# Windows
./start-dev.bat

# Linux/Mac
chmod +x start-dev.sh && ./start-dev.sh
```

### Manual Setup
```bash
# Backend (Terminal 1)
cd backend
npm install
npm run dev

# Frontend (Terminal 2)
cd frontend  
npm install
npm run dev
```

## 🌐 Access
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/health

## 📁 Project Structure
```
├── backend/          # Node.js/Express API
├── frontend/         # Next.js React App
├── start-dev.bat     # Windows start script
└── start-dev.sh      # Linux/Mac start script
```

For complete documentation, see `README-SEPARATED.md`.

## ⚠️ Important Note About Data Storage

**For the current demo deployment**: The blog uses in-memory storage, which means:
- ✅ You can add, edit, and delete entries
- ⚠️ Data resets when the app redeploys (when you push new code)
- 🎯 Perfect for testing and demo purposes

**For permanent data storage**, you can easily upgrade to:
- **Vercel KV** (Redis-based, free tier available)
- **Supabase** (PostgreSQL, free tier available) 
- **MongoDB Atlas** (NoSQL, free tier available)
- **Airtable** (Spreadsheet-like database)

The current setup gives you a fully functional blog to test and customize before choosing a permanent database solution.

---
