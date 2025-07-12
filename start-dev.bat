@echo off
echo 🚀 Starting Personal Blog (Frontend + Backend)
echo.

echo 🧹 Cleaning up existing processes...
taskkill /f /im "node.exe" >nul 2>&1

echo 📦 Starting Backend API (Port 5000)...
cd backend
start "Backend API" cmd /k "npm run dev"

echo ⏳ Waiting for backend to start...
timeout /t 3 /nobreak >nul

echo 🌐 Starting Frontend (Port 3000)...
cd ..\frontend
start "Frontend" cmd /k "npm run dev"

echo.
echo ✅ Both services are starting...
echo 📊 Backend API: http://localhost:5000
echo 🌐 Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause >nul
