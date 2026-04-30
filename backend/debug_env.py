import os
from dotenv import load_dotenv

print("Checking .env file in current directory...")
if os.path.exists(".env"):
    print(".env file exists")
    with open(".env", "r") as f:
        lines = f.readlines()
        for line in lines:
            if "GROQ_API_KEY" in line:
                print(f"Found GROQ_API_KEY line in .env (length: {len(line)})")

load_dotenv()
key = os.getenv("GROQ_API_KEY")
if key:
    print(f"GROQ_API_KEY loaded: {key[:10]}...")
else:
    print("GROQ_API_KEY NOT found in environment after load_dotenv")

print(f"Current Working Directory: {os.getcwd()}")
