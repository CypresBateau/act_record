@echo off
echo ========================================
echo Starting Graduate Union Archive System
echo ========================================
echo.

echo Checking ports...
netstat -ano | findstr :3000 | findstr LISTENING >nul 2>&1
if %errorlevel% equ 0 (
    echo WARNING: Port 3000 is already in use
    echo Please run kill.bat first
    echo.
    pause
    exit /b 1
)

netstat -ano | findstr :5000 | findstr LISTENING >nul 2>&1
if %errorlevel% equ 0 (
    echo WARNING: Port 5000 is already in use
    echo Please run kill.bat first
    echo.
    pause
    exit /b 1
)

echo Ports OK
echo.
echo Starting project...
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo.
echo Press Ctrl+C to stop
echo.

npm run dev
