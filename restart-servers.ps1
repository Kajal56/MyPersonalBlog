#!/usr/bin/env pwsh

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Personal Blog - Server Restart Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Kill Node processes
Write-Host "[1/4] Killing all Node.js processes..." -ForegroundColor Yellow
try {
    $processes = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($processes) {
        $processes | Stop-Process -Force
        Write-Host "✓ Node.js processes terminated" -ForegroundColor Green
    } else {
        Write-Host "ℹ No Node.js processes were running" -ForegroundColor Blue
    }
} catch {
    Write-Host "ℹ No Node.js processes found" -ForegroundColor Blue
}

# Step 2: Wait for cleanup
Write-Host ""
Write-Host "[2/4] Waiting for processes to fully terminate..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

# Step 3: Start Backend
Write-Host ""
Write-Host "[3/4] Starting Backend Server (Port 5000)..." -ForegroundColor Yellow
try {
    $backendJob = Start-Job -ScriptBlock {
        Set-Location "backend"
        node server.js
    }
    Write-Host "✓ Backend server starting..." -ForegroundColor Green
    Start-Sleep -Seconds 3
} catch {
    Write-Host "✗ Failed to start backend server" -ForegroundColor Red
}

# Step 4: Start Frontend
Write-Host ""
Write-Host "[4/4] Starting Frontend Server (Port 3000)..." -ForegroundColor Yellow
try {
    $frontendJob = Start-Job -ScriptBlock {
        Set-Location "frontend"
        npm run dev
    }
    Write-Host "✓ Frontend server starting..." -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to start frontend server" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✓ Server restart complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend:  http://localhost:5000" -ForegroundColor Blue
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Blue
Write-Host ""
Write-Host "Servers are running in background jobs." -ForegroundColor Yellow
Write-Host "Use 'Get-Job' to check status and 'Stop-Job' to stop them." -ForegroundColor Yellow
