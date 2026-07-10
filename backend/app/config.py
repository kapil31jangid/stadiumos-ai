import os
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()

class Settings:
    PROJECT_ID: str = os.getenv("GCP_PROJECT", "stadiumsense-ai")
    USE_MOCKS: bool = os.getenv("USE_MOCKS", "true").lower() == "true"
    PORT: int = int(os.getenv("PORT", "8080"))
    HOST: str = os.getenv("HOST", "0.0.0.0")

settings = Settings()
