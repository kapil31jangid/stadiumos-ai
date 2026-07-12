from fastapi import APIRouter
from utils.supabase_client import supabase

router = APIRouter()

@router.get("/api/health", tags=["Health"])
async def root():
    db_status = "connected" if supabase else "offline"
    return {"status": "online", "model": "gemini-2.5-flash", "db": db_status}
