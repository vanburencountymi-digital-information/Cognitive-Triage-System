FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend code
COPY . .

# Create necessary directories and files
RUN mkdir -p /app/backend
RUN touch /app/backend/crew_run.log

# Expose port
EXPOSE 5000

# Run the Flask app
CMD ["python", "app.py"] 