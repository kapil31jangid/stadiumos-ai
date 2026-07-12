import os
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

load_dotenv()

llm = None

if os.getenv("GOOGLE_API_KEY"):
    try:
        # Initializing Gemini client with async capability
        llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash")
        print("Gemini AI initialized successfully")
    except Exception as e:
        print(f"Error initializing Gemini AI: {e}")
else:
    print("Warning: GOOGLE_API_KEY missing from environment. AI features will fallback.")
