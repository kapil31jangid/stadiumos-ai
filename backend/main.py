import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, BackgroundTasks, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
import firebase_admin
from firebase_admin import credentials, firestore
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

load_dotenv()

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("stadiumos-api")

# Firebase Initialization
firebase_app = None
db = None

try:
    cred_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")
    if cred_path and os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_app = firebase_admin.initialize_app(cred)
    else:
        # Attempt to use application default credentials (GCP environment)
        firebase_app = firebase_admin.initialize_app()
    db = firestore.client()
    logger.info("Firebase initialized successfully")
except Exception as e:
    logger.warning(f"Firebase not initialized: {e}")

# Gemini Initialization
llm = None
if os.getenv("GOOGLE_API_KEY"):
    try:
        # Use ainvoke for better concurrency
        llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash")
        logger.info("Gemini AI initialized successfully")
    except Exception as e:
        logger.warning(f"Gemini AI not initialized: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    yield
    # Shutdown logic

app = FastAPI(
    title="StadiumOS AI API", 
    description="Intelligent Stadium Crowd Management API",
    version="1.0.1",
    lifespan=lifespan
)

# Security: Harden CORS policies
# Restrict to known origins in production
ALLOWED_ORIGINS = [
    "https://crowdsense-ai-kjmupfekoq-ew.a.run.app",
    "https://crowdsense-ai-671336977433.europe-west1.run.app",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Schemas with validation
class RecommendationRequest(BaseModel):
    user_location: str = Field(..., min_length=2, max_length=100, description="Current location of the attendee")
    destination: str = Field(..., min_length=2, max_length=100, description="Desired destination")

class AnnouncementCreate(BaseModel):
    incident: str = Field(..., description="Describe the incident")
    location: str = Field(..., description="Location of incident")
    severity: str = Field(..., description="Low, Medium, or High")

class IncidentCreate(BaseModel):
    type: str = Field(..., description="Type of incident")
    location: str = Field(..., description="Location details")
    severity: str = Field(..., description="Severity level")
    description: str = Field(..., description="Full description")

def log_api_usage(endpoint: str, details: str):
    """Background task for telemetry logging"""
    logger.info(f"API Engagement | Endpoint: {endpoint} | Details: {details}")

# API Routes
@app.get("/api/health", tags=["Health"])
async def root():
    return {"status": "online", "model": "gemini-1.5-flash", "db": "connected" if db else "offline"}

@app.get("/api/metrics", tags=["Crowd Data"])
async def get_metrics(background_tasks: BackgroundTasks):
    if not db:
        raise HTTPException(status_code=503, detail="Database service unavailable")
    
    try:
        background_tasks.add_task(log_api_usage, "/metrics", "Snapshot requested")
        
        zones = db.collection("zones").stream()
        total_density = 0
        zone_count = 0
        high_density_zones = []
        
        for zone in zones:
            data = zone.to_dict()
            density = data.get("current_density", data.get("density", 0))
            total_density += density
            zone_count += 1
            if density > 0.8:
                high_density_zones.append(data.get("name"))
        
        avg_occupancy = total_density / zone_count if zone_count > 0 else 0
        
        return {
            "overall_occupancy": round(avg_occupancy, 2),
            "zone_count": zone_count,
            "high_density_alerts": high_density_zones,
            "status": "Critical" if avg_occupancy > 0.8 else "Normal"
        }
    except Exception as e:
        logger.error(f"Error fetching metrics: {e}")
        raise HTTPException(status_code=500, detail="Internal server error while processing crowd data")

@app.post("/api/recommend", tags=["AI Assistance"])
async def get_recommendation(request: RecommendationRequest, background_tasks: BackgroundTasks):
    # 1. Fetch live context from Firestore (Needed for both AI and Fallback)
    stadium_context = ""
    zones_list = []
    try:
        zones = db.collection("zones").stream()
        for zone in zones:
            data = zone.to_dict()
            density = data.get("current_density", data.get("density", 0))
            name = data.get("name", "Unknown Zone")
            zones_list.append({"name": name, "density": density})
            stadium_context += f"- {name}: {density:.1%} full, status: {data.get('status')}\n"
    except Exception as e:
        logger.warning(f"Failed to fetch context: {e}")
        stadium_context = "Crowd data currently unavailable."

    # 2. Handle LLM Offline (Intelligent Fallback)
    if not llm:
        best_zone = "Main Concourse"
        lowest_density = 1.0
        
        # Simple algorithm: Find the least crowded zone
        for z in zones_list:
            if z["name"] != request.user_location and z["density"] < lowest_density:
                lowest_density = z["density"]
                best_zone = z["name"]
        
        return {
            "recommendation": f"Head to the destination. Current data suggests the clearest path is via {best_zone} ({lowest_density:.0%} occupancy). [Smart Fallback Mode]",
            "status": "Fallback"
        }
    background_tasks.add_task(log_api_usage, "/recommend", f"Route: {request.user_location} -> {request.destination}")

    # 3. AI Mode
    prompt = (
        f"You are the StadiumOS AI Assistant. \n"
        f"Current Stadium State:\n{stadium_context}\n"
        f"Attendee Location: {request.user_location}\n"
        f"Target Destination: {request.destination}\n\n"
        "Recommend the most efficient path. If certain zones are 'Congested' or 'Critical', "
        "suggest alternatives. Explain your reasoning briefly based on the live data provided."
    )
    
    try:
        response = await llm.ainvoke(prompt)
        return {"recommendation": response.content, "status": "Success"}
    except Exception as e:
        logger.error(f"Gemini Invoke Error: {e}")
        return {
            "recommendation": f"Proceed to {request.destination}. Watch for signs in the main concourse or consult stadium staff. [Service Error Fallback]",
            "status": "Error-Fallback"
        }

@app.post("/api/announcements/generate", tags=["AI Assistance"])
async def generate_announcement(request: AnnouncementCreate):
    if not llm:
        return {
            "public_announcement": f"ALERT: Incident ({request.incident}) reported at {request.location}. Please follow signs. [Offline Mode]",
            "volunteer_instructions": "Check location, assist spectators, monitor gates. [Offline Mode]",
            "security_brief": "Deploy officers, check access corridors. [Offline Mode]",
            "translations": {
                "en": f"ALERT: {request.incident} at {request.location}.",
                "es": f"ALERTA: {request.incident} en {request.location}."
            }
        }
    
    prompt = (
        f"You are the StadiumOS AI Announcement Engine.\n"
        f"Incident: {request.incident}\n"
        f"Location: {request.location}\n"
        f"Severity: {request.severity}\n\n"
        "Generate a structured JSON response containing:\n"
        "1. 'public_announcement': Clear instruction for public address broadcast system.\n"
        "2. 'volunteer_instructions': Specific duties for local volunteers.\n"
        "3. 'security_brief': Brief for dispatching security officers.\n"
        "4. 'translations': A dictionary containing translations of the public announcement in: en, es, fr, ar, hi, ja.\n\n"
        "Return ONLY a valid JSON object matching these keys. Do not include markdown formatting or backticks."
    )
    try:
        response = await llm.ainvoke(prompt)
        import json
        content = response.content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.endswith("```"):
            content = content[:-3]
        return json.loads(content.strip())
    except Exception as e:
        logger.error(f"Announcement generation error: {e}")
        return {
            "public_announcement": f"ALERT: Incident ({request.incident}) at {request.location}. Proceed with caution.",
            "volunteer_instructions": "Assist with crowd flow near location.",
            "security_brief": "Review security status at location.",
            "translations": {
                "en": f"ALERT: {request.incident} at {request.location}."
            }
        }

@app.post("/api/incidents", tags=["Incidents"])
async def create_incident(request: IncidentCreate):
    incident_data = {
        "type": request.type,
        "location": request.location,
        "severity": request.severity,
        "description": request.description,
        "timestamp": firestore.SERVER_TIMESTAMP if db else None
    }
    
    if db:
        try:
            db.collection("incidents").add(incident_data)
        except Exception as e:
            logger.warning(f"Failed to save incident to Firestore: {e}")

    if not llm:
        return {
            "summary": f"Incident logged: {request.type} at {request.location}",
            "priority": "HIGH" if request.severity == "Critical" else "MEDIUM",
            "suggested_response": "Deploy standard personnel to site. [Offline Mode]"
        }
        
    prompt = (
        f"You are the StadiumOS Security & Operations AI.\n"
        f"Incident logged: {request.type}\n"
        f"Location: {request.location}\n"
        f"Severity: {request.severity}\n"
        f"Description: {request.description}\n\n"
        "Generate a brief JSON response containing:\n"
        "1. 'summary': Single-sentence description of the issue.\n"
        "2. 'priority': Assessment (URGENT, HIGH, MEDIUM, LOW).\n"
        "3. 'suggested_response': Standard operational mitigation recommendation.\n\n"
        "Return ONLY a valid JSON object matching these keys."
    )
    try:
        response = await llm.ainvoke(prompt)
        import json
        content = response.content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.endswith("```"):
            content = content[:-3]
        return json.loads(content.strip())
    except Exception as e:
        logger.error(f"Incident analysis error: {e}")
        return {
            "summary": f"Reported {request.type} at {request.location}.",
            "priority": "HIGH" if request.severity == "Critical" else "MEDIUM",
            "suggested_response": "Standard check by security dispatch."
        }

@app.get("/api/sustainability/recommendations", tags=["Sustainability"])
async def get_sustainability_recommendations():
    if not llm:
        return {
            "recommendations": [
                "Optimize lighting schedules during non-peak window.",
                "Verify water pressure levels in restrooms."
            ]
        }
    
    prompt = (
        "You are the StadiumOS Sustainability AI.\n"
        "Analyze the current FIFA 2026 match-day operations.\n"
        "Provide three actionable green recommendations to save resources (e.g., energy, water, HVAC loads).\n"
        "Return ONLY a valid JSON object containing a 'recommendations' key which is a list of strings."
    )
    try:
        response = await llm.ainvoke(prompt)
        import json
        content = response.content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.endswith("```"):
            content = content[:-3]
        return json.loads(content.strip())
    except Exception as e:
        logger.error(f"Sustainability recommendations error: {e}")
        return {
            "recommendations": [
                "Reduce concourse overhead lighting during high daylight hours.",
                "Stagger HVAC startup cycles to avoid power demand spikes."
            ]
        }

@app.get("/api/venue/maintenance", tags=["Facility Management"])
async def get_maintenance_suggestions():
    if not llm:
        return {
            "suggestions": [
                "Inspect escalators in West Concourse.",
                "Review water filtration levels."
            ]
        }
    
    prompt = (
        "You are the StadiumOS Maintenance Support AI.\n"
        "Generate three preventative maintenance task recommendations for a FIFA World Cup stadium based on equipment load.\n"
        "Return ONLY a valid JSON object containing a 'suggestions' key which is a list of strings."
    )
    try:
        response = await llm.ainvoke(prompt)
        import json
        content = response.content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.endswith("```"):
            content = content[:-3]
        return json.loads(content.strip())
    except Exception as e:
        logger.error(f"Maintenance suggestions error: {e}")
        return {
            "suggestions": [
                "Monitor elevator cabin vibration levels in Section 102.",
                "Service entrance Gate B turnstile bearings before halftime surge."
            ]
        }

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
    port = int(os.getenv("PORT", 8080)) # Default to 8080 for Cloud Run
    uvicorn.run(app, host="0.0.0.0", port=port)
