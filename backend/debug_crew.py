import os
from dotenv import load_dotenv

load_dotenv()
try:
    print("Attempting to import crew...")
    from crew import create_content_strategy_crew
    print("SUCCESS: crew module imported.")
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
