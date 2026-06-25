import asyncio
import sys
import os
from unittest.mock import MagicMock

# Add current path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.services.auth_service import auth_service

# Mock user data
class MockUserData:
    email = "non_existent_user_xyz_999@example.com"
    password = "wrong_password"

async def main():
    print("Executing auth_service.login test...")
    try:
        user_data = MockUserData()
        await auth_service.login(user_data)
        print("Success")
    except Exception as e:
        import traceback
        print("Caught Exception during login:")
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
