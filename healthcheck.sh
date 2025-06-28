#!/bin/bash

# Health check script for Railway
# This script checks if both nginx and the backend are responding

# Check if nginx is running
if ! pgrep nginx > /dev/null; then
    echo "ERROR: nginx is not running"
    exit 1
fi

# Check if the health endpoint is responding
if curl -f -s http://localhost:8080/health > /dev/null; then
    echo "SUCCESS: Health check passed"
    exit 0
else
    echo "ERROR: Health endpoint not responding"
    exit 1
fi 