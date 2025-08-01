@echo off
title Personal Blog - Server Manager

echo ========================================
echo Personal Blog - Server Restart Script
echo ========================================
echo.

REM Kill all Node.js processes
echo [1/4] Killing all Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo SUCCESS: Node.js processes terminated
) else (
    echo INFO: No Node.js processes were running
)

REM Wait for cleanup
echo.
echo [2/4] Waiting for processes to fully terminate...
ping 127.0.0.1 -n 3 >nul

REM Start Backend
echo.
echo [3/4] Starting Backend Server (Port 5000)...
if exist "backend\server.js" (
    start "Backend Server" cmd /k "cd backend && echo Backend starting on port 5000... && node server.js"
    echo SUCCESS: Backend server starting...
) else (
    echo ERROR: backend\server.js not found!
    goto :error
)

REM Wait a bit
ping 127.0.0.1 -n 4 >nul

REM Start Frontend
echo.
echo [4/4] Starting Frontend Server (Port 3000)...
if exist "frontend\package.json" (
    start "Frontend Server" cmd /k "cd frontend && echo Frontend starting on port 3000... && npm run dev"
    echo SUCCESS: Frontend server starting...
) else (
    echo ERROR: frontend\package.json not found!
    goto :error
)

echo.
echo ========================================
echo SUCCESS: Server restart complete!
echo ========================================
echo.
echo Backend API:  http://localhost:5000
echo Frontend App: http://localhost:3000
echo Health Check: http://localhost:5000/health
echo.
echo Both servers are running in separate windows.
echo Close those windows to stop the servers.
echo.
goto :end

:error
echo.
echo ERROR: Script must be run from the project root directory!
echo Make sure you're in the folder containing 'backend' and 'frontend' folders.
echo.

:end
echo Press any key to close this window...
pause >nul
