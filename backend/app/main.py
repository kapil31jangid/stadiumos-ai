import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.routers import navigation, operator
from app.config import settings

app = FastAPI(
    title="StadiumSense AI API",
    description="Fan Navigation & Crowd Management Engine for FIFA World Cup 2026",
    version="1.0.0"
)

# Register routers
app.include_router(navigation.router)
app.include_router(operator.router)

@app.get("/health")
async def health_check():
    """
    Health check endpoint for container probes and deployment verification.
    """
    return {
        "status": "healthy",
        "project_id": settings.PROJECT_ID,
        "mock_mode": settings.USE_MOCKS
    }

# Mount the static files (compiled frontend React application)
# Stage 2 of Dockerfile copies built frontend assets to `/app/app/static`
static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")
else:
    # If the static directory doesn't exist, we can output a message on startup
    @app.get("/")
    async def root_placeholder():
        return {
            "message": "StadiumSense AI API is running. Frontend static assets not mounted (run frontend dev server separately)."
        }
