@echo off
echo Starting School Tasks Application...

echo.
echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend && node src/server.js"

timeout /t 3 /nobreak >nul

echo.
echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd frontend && node node_modules/next/dist/bin/next dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000 (or 3002 if 3000 is busy)
echo.
echo Wait a few seconds for servers to start, then open your browser.
echo.
pause
