@echo off
echo ========================================
echo Personal Blog - Server Restart Script
echo ========================================

echo.
echo [1/4] Killing all Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Node.js processes terminated
) else (
    echo ℹ No Node.js processes were running
)

echo.
echo [2/4] Waiting for processes to fully terminate...
timeout /t 2 /nobreak >nul

echo.
echo [3/4] Starting Backend Server (Port 5000)...
start "Personal Blog Backend" cmd /k "cd /d %~dp0backend && echo Starting backend server... && node server.js"
timeout /t 3 /nobreak >nul

echo.
echo [4/4] Starting Frontend Server (Port 3000)...
start "Personal Blog Frontend" cmd /k "cd /d %~dp0frontend && echo Starting frontend server... && npm run dev"

echo.
echo ========================================
echo ✓ Server restart complete!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to close this window...
pause >nul
