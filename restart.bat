@echo off
echo ========================================
echo Restarting System
echo ========================================
echo.

echo Step 1: Stopping...
echo.
call kill.bat

echo.
echo Waiting 2 seconds...
timeout /t 2 /nobreak >nul

echo.
echo Step 2: Starting...
echo.
call start.bat
