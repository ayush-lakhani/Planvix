import sys
import os

# Add the project root to sys.path
sys.path.append(os.getcwd())

try:
    from app.services.auth_service import auth_service
    print("SUCCESS: auth_service imported correctly")
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
