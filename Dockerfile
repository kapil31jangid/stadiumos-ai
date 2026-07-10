# syntax=docker/dockerfile:1

# ---------- Stage 1: build the frontend ----------
FROM node:20-slim AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci --no-audit --no-fund
COPY frontend/ ./
RUN npm run build
# produces /frontend/dist

# ---------- Stage 2: backend runtime ----------
FROM python:3.12-slim AS backend

# Prevent Python from writing .pyc files / buffering stdout (cleaner Cloud Run logs)
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8080

WORKDIR /app

# System deps kept minimal for a small, fast, low-attack-surface image
RUN apt-get update && apt-get install -y --no-install-recommends \
        curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps first for better layer caching
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend/app ./app

# Copy built frontend static assets from stage 1
COPY --from=frontend-build /frontend/dist ./app/static

# Run as non-root user (security requirement)
RUN useradd --create-home --uid 10001 appuser \
    && chown -R appuser:appuser /app
USER appuser

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:${PORT}/health || exit 1

# Single worker is fine for Cloud Run (it scales via container instances, not in-process workers)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
