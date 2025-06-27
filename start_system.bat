@echo off
echo ========================================
echo Cognitive Triage System Startup
echo ========================================
echo.
echo This will start both the backend and frontend servers.
echo.
echo Make sure you have:
echo 1. Python installed and in your PATH
echo 2. Node.js installed and in your PATH
echo 3. OpenAI API key in .env file
echo.
pause

echo.
echo Starting Backend Server...
echo.
start "Backend Server" cmd /k "cd backend && python app.py"

echo.
echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak > nul

echo.
echo Starting Frontend Server...
echo.
start "Frontend Server" cmd /k "cd frontend && npm start"

echo.
echo ========================================
echo Both servers are starting...
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to close this window...
pause > nul 