@echo off
echo Starting Cognitive Triage System with Docker Compose...
echo.

echo Building and starting services...
docker-compose up --build

echo.
echo Services are starting up...
echo Frontend will be available at: http://localhost:3000
echo Backend API will be available at: http://localhost:5000
echo.
echo Press Ctrl+C to stop the services 