@echo off
echo ========================================
echo Personal Blog - Stop Servers Script
echo ========================================

echo.
echo Stopping all Node.js processes...
taskkill /F /IM node.exe >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ All servers stopped
) else (
    echo ℹ No servers were running
)

echo.
echo ✓ Done!
pause
