from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address
import asyncio

def get_user_rate_key(request: Request) -> str:
    return "test"

def get_tiered_limit(request: Request) -> str:
    return "1/minute"

limiter = Limiter(
    key_func=get_user_rate_key,
    default_limits=[get_tiered_limit]
)

async def test():
    # Mock request
    class MockRequest:
        def __init__(self):
            self.scope = {"type": "http"}
            self.state = type('obj', (object,), {'user_id': None, 'user_tier': 'free'})
    
    request = MockRequest()
    print("Testing limiter...")
    try:
        # In slowapi, default_limits functions are called.
        # Let's see how they are called.
        for limit in limiter._default_limits:
            if callable(limit):
                print(f"Calling limit function: {limit}")
                # We can't easily call limiter.check without a real Starlette/FastAPI app context
                # but we can try to see if it works with request
                try:
                    res = limit(request)
                    print(f"Result with request: {res}")
                except TypeError as e:
                    print(f"Error with request: {e}")
                
                try:
                    res = limit()
                    print(f"Result without request: {res}")
                except TypeError as e:
                    print(f"Error without request: {e}")
    except Exception as e:
        print(f"General error: {e}")

if __name__ == "__main__":
    asyncio.run(test())
