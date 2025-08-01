# Personal Blog - Server Management Scripts

This project includes several convenient scripts to manage both frontend and backend servers automatically.

## 🚀 Quick Start

### Option 1: Using Batch Files (Windows - Recommended)

**Start both servers:**
```bash
# Double-click or run in command prompt
restart-servers.bat
```

**Stop all servers:**
```bash
# Double-click or run in command prompt
stop-servers.bat
```

### Option 2: Using NPM Scripts

**Start both servers simultaneously:**
```bash
npm run start:all
```

**Stop all servers:**
```bash
npm run stop
```

**Restart servers (stop + start):**
```bash
npm run restart
```

### Option 3: Using PowerShell (Cross-platform)

```powershell
# PowerShell script
.\restart-servers.ps1
```

### Option 4: Using Shell Script (Linux/Mac)

```bash
# Make executable first
chmod +x restart-servers.sh

# Run the script
./restart-servers.sh
```

## 📋 What These Scripts Do

1. **Kill all Node.js processes** (clean slate)
2. **Wait for cleanup** (2 seconds)
3. **Start Backend Server** on port 5000
4. **Start Frontend Server** on port 3000
5. **Display status and URLs**

## 🌐 Server URLs

- **Frontend (Next.js):** http://localhost:3000
- **Backend (Express API):** http://localhost:5000
- **Backend Health Check:** http://localhost:5000/health

## 📁 Available Scripts

| Script | Purpose | Platform |
|--------|---------|----------|
| `restart-servers.bat` | Restart both servers | Windows |
| `stop-servers.bat` | Stop all servers | Windows |
| `restart-servers.ps1` | Restart both servers | PowerShell (Cross-platform) |
| `restart-servers.sh` | Restart both servers | Unix/Linux/Mac |
| `npm run start:all` | Start both servers | Cross-platform |
| `npm run stop` | Stop all servers | Cross-platform |
| `npm run restart` | Restart servers | Cross-platform |

## 🔧 Manual Commands (If needed)

**Kill all Node processes:**
```bash
# Windows
taskkill /F /IM node.exe

# Unix/Linux/Mac
pkill -f node
```

**Start servers individually:**
```bash
# Backend (in backend folder)
cd backend && node server.js

# Frontend (in frontend folder)  
cd frontend && npm run dev
```

## 📝 Notes

- Scripts automatically handle process cleanup
- Frontend and backend run in separate windows/processes
- All scripts include proper error handling
- Windows batch files show colored output and status messages
- PowerShell and shell scripts include process IDs for manual control

## 🎯 Recommended Usage

For **Windows users**: Use `restart-servers.bat` - it's the most user-friendly with visual feedback.

For **development workflow**: Use `npm run start:all` for consistent cross-platform experience.

For **production**: Use individual server start commands or PM2 process manager.
