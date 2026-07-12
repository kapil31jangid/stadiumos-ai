import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv

# Import Routers
from routes.health import router as health_router
from routes.crowd import router as crowd_router
from routes.incidents import router as incidents_router
from routes.sustainability import router as sustainability_router

load_dotenv()

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("stadiumos-api")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    yield
    # Shutdown logic

app = FastAPI(
    title="StadiumOS AI API", 
    description="Intelligent Stadium Crowd Management API (Supabase Edition)",
    version="2.0.0",
    lifespan=lifespan
)

# CORS configuration
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
]

# Extend with production frontend URL from env if set
_frontend_url = os.getenv("FRONTEND_URL", "")
if _frontend_url:
    ALLOWED_ORIGINS.append(_frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",  # allow all Vercel preview deployments
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(health_router)
app.include_router(crowd_router)
app.include_router(incidents_router)
app.include_router(sustainability_router)

@app.get("/")
async def root():
    return {"message": "StadiumOS AI Backend API is running. Check health at /api/health"}

# Static File Serving (For Cloud Run host-and-serve)
static_dir = os.path.join(os.getcwd(), "static")
if os.path.exists(static_dir):
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")
    @app.exception_handler(404)
    async def custom_404_handler(request, __):
        return FileResponse(os.path.join(static_dir, "index.html"))
else:
    logger.warning("Static directory not found. API-only mode enabled.")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)
