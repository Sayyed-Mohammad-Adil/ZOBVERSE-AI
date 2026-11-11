FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install lightweight CPU-only PyTorch (prevents downloading 2.5GB CUDA wheels)
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

# Copy and install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt \
    && python -m pip install --no-cache-dir laya \
    && pip install --no-cache-dir playwright

# Copy application source
COPY . .

# Expose port
EXPOSE 8000

# Default command for backend (overridden in worker service)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
