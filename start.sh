#!/bin/bash

# Function to check if a service is running
check_service() {
    local service_name=$1
    local port=$2
    local max_attempts=30
    local attempt=1
    
    echo "Waiting for $service_name to be ready on port $port..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s http://localhost:$port/health > /dev/null 2>&1; then
            echo "$service_name is ready!"
            return 0
        fi
        
        echo "Attempt $attempt/$max_attempts: $service_name not ready yet..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo "ERROR: $service_name failed to start after $max_attempts attempts"
    return 1
}

# Start nginx in the background
echo "Starting nginx on port 8080..."
nginx

# Wait a moment for nginx to start
sleep 2

# Start the Flask backend in the background
echo "Starting Flask backend on port 5000..."
cd /app
python app.py &
BACKEND_PID=$!

# Wait for backend to be ready
if check_service "Flask backend" 5000; then
    echo "All services started successfully!"
    echo "Nginx listening on port 8080 (external)"
    echo "Flask backend listening on port 5000 (internal)"
    
    # Wait for the backend process
    wait $BACKEND_PID
else
    echo "Backend failed to start. Stopping nginx..."
    nginx -s quit
    exit 1
fi 