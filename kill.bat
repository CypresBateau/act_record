@echo off

:: Check for admin rights
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Requesting administrator privileges...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

echo ========================================
echo Stopping Graduate Union Archive System
echo ========================================
echo.

echo [1/2] Killing port 3000...
powershell -Command "$port3000 = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue; if ($port3000) { $port3000 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }; Write-Host 'Port 3000 cleared' } else { Write-Host 'No process on port 3000' }"

echo.
echo [2/2] Killing port 5000...
powershell -Command "$port5000 = Get-NetTCPConnection -LocalPort 5000 -State Listen -ErrorAction SilentlyContinue; if ($port5000) { $port5000 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }; Write-Host 'Port 5000 cleared' } else { Write-Host 'No process on port 5000' }"

echo.
echo ========================================
echo System stopped!
echo ========================================
echo.
pause
