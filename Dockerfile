FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (needed for pandas, numpy, spacy)
RUN apt-get update && apt-get install -y \
    build-essential \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy project
COPY . .

# Upgrade pip
RUN pip install --upgrade pip

# Install dependencies
RUN pip install -r requirements.txt

# Start app
CMD ["gunicorn", "backend.app:app", "--bind", "0.0.0.0:10000"]