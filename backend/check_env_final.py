import os
from dotenv import load_dotenv

load_dotenv()
exists = os.path.exists(".env")
key_found = bool(os.getenv("GROQ_API_KEY"))

print(f"ENV_EXISTS: {exists}")
print(f"KEY_FOUND: {key_found}")
if key_found:
    print(f"KEY_VAL: {os.getenv('GROQ_API_KEY')[:10]}...")
