import os
from dotenv import load_dotenv

print("--- DEBUGGING CREWAI ACTIVATION ---")
load_dotenv()

print(f"GROQ_API_KEY present: {bool(os.getenv('GROQ_API_KEY'))}")
if os.getenv('GROQ_API_KEY'):
    print(f"Key starts with: {os.getenv('GROQ_API_KEY')[:10]}...")

try:
    print("Attempting to import from crew...")
    from crew import create_content_strategy_crew
    print("✅ Import successful")
    crew_enabled = bool(os.getenv("GROQ_API_KEY"))
except Exception as e:
    print(f"❌ Import failed: {e}")
    crew_enabled = False

print(f"FINAL CREW_AI_ENABLED STATUS: {crew_enabled}")
