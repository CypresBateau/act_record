@echo off
echo ========================================
echo Kill ALL Node.js processes
echo ========================================
echo.
echo WARNING: This will stop ALL Node.js programs!
echo.
pause

echo.
echo Killing all node.exe processes...
taskkill /F /IM node.exe >nul 2>&1

if %errorlevel% equ 0 (
    echo All Node.js processes killed
) else (
    echo No Node.js processes found
)

echo.
echo ========================================
echo Done!
echo ========================================
echo.
pause
