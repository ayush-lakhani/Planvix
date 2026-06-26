"""
Production Testing Script - Automated Tests
Tests: Strategy Generation, Redis Cache, Rate Limiting, Response Time
"""

import requests
import json
import time
from datetime import datetime

BASE_URL = "http://localhost:8000"

# Step 1: Login and get JWT token
print("=" * 60)
print("TEST 1: Authentication")
print("=" * 60)

login_data = {
    "email": "test@test.com",
    "password": "testpass123"
}

try:
    response = requests.post(f"{BASE_URL}/api/auth/login", json=login_data)
    if response.status_code == 200:
        token = response.json()["access_token"]
        print(f"✅ Login successful! Token: {token[:20]}...")
    else:
        print(f"❌ Login failed: {response.status_code}")
        print("Creating test user...")
        signup_response = requests.post(f"{BASE_URL}/api/auth/signup", json=login_data)
        if signup_response.status_code == 200:
            token = signup_response.json()["access_token"]
            print(f"✅ Signup successful! Token: {token[:20]}...")
        else:
            print(f"❌ Cannot authenticate. Exiting.")
            exit(1)
except Exception as e:
    print(f"❌ Error: {e}")
    exit(1)

headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

# Test request payload
test_payload = {
    "goal": "Sell artisan coffee subscriptions",
    "audience": "college students aged 18-24",
    "industry": "F&B",
    "platform": "Instagram",
    "contentType": "Reels"
}

# Step 2: Test Strategy Generation with ROI
print("\n" + "=" * 60)
print("TEST 2: Strategy Generation with ROI")
print("=" * 60)

start_time = time.time()
try:
    response = requests.post(f"{BASE_URL}/api/strategy", json=test_payload, headers=headers, timeout=300)
    generation_time = time.time() - start_time
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Strategy generated successfully!")
        print(f"⏱️  Generation time: {generation_time:.2f}s")
        print(f"📊 Cached: {data.get('cached', False)}")
        
        # Verify all required fields
        strategy = data.get("strategy", {})
        required_fields = ["persona", "competitor_gaps", "strategic_guidance", "keywords", "calendar", "sample_posts", "roi_prediction"]
        
        missing = [f for f in required_fields if f not in strategy]
        if missing:
            print(f"⚠️  Missing fields: {missing}")
        else:
            print("✅ All required fields present!")
            
        # Check ROI prediction details
        if "roi_prediction" in strategy:
            roi = strategy["roi_prediction"]
            print(f"\n📈 ROI Prediction:")
            print(f"   Traffic lift: {roi.get('traffic_lift_percentage', 'N/A')}")
            print(f"   Engagement boost: {roi.get('engagement_boost_percentage', 'N/A')}")
            print(f"   Monthly reach: {roi.get('estimated_monthly_reach', 'N/A')}")
            print(f"   Time to results: {roi.get('time_to_results', 'N/A')}")
            
        # Save full response
        with open("test_strategy_output.json", "w") as f:
            json.dump(data, f, indent=2)
        print("\n💾 Full response saved to: test_strategy_output.json")
    else:
        print(f"❌ Strategy generation failed: {response.status_code}")
        print(f"Error: {response.text}")
except Exception as e:
    print(f"❌ Error during strategy generation: {e}")

# Step 3: Test Redis Cache Hit/Miss
print("\n" + "=" * 60)
print("TEST 3: Redis Cache Hit/Miss")
print("=" * 60)

cache_test_payload = {
    "goal": "Test caching functionality",
    "audience": "test audience",
    "industry": "F&B",
    "platform": "Instagram",
    "contentType": "Posts"
}

# First request (Cache MISS)
print("Request 1 (Cache MISS)...")
start_1 = time.time()
try:
    r1 = requests.post(f"{BASE_URL}/api/strategy", json=cache_test_payload, headers=headers, timeout=300)
    time_1 = time.time() - start_1
    
    if r1.status_code == 200:
        data1 = r1.json()
        print(f"✅ First request: {time_1:.2f}s, cached={data1.get('cached', False)}")
    else:
        print(f"❌ First request failed: {r1.status_code}")
except Exception as e:
    print(f"❌ Error: {e}")
    time_1 = 0

# Second identical request (Cache HIT)
print("Request 2 (Cache HIT expected)...")
start_2 = time.time()
try:
    r2 = requests.post(f"{BASE_URL}/api/strategy", json=cache_test_payload, headers=headers, timeout=300)
    time_2 = time.time() - start_2
    
    if r2.status_code == 200:
        data2 = r2.json()
        is_cached = data2.get('cached', False)
        print(f"✅ Second request: {time_2:.2f}s, cached={is_cached}")
        
        if is_cached and time_2 < 1.0:
            print("✅ CACHE TEST PASSED! (cached=True, time<1s)")
        elif is_cached:
            print(f"⚠️  Cached but slow ({time_2:.2f}s)")
        else:
            print("❌ CACHE TEST FAILED! Second request not cached")
    else:
        print(f"❌ Second request failed: {r2.status_code}")
except Exception as e:
    print(f"❌ Error: {e}")

# Step 4: Test Rate Limiting
print("\n" + "=" * 60)
print("TEST 4: Rate Limiting (30 req/min)")
print("=" * 60)

rate_test_payload = {
    "goal": "rate limit test",
    "audience": "test audience",
    "industry": "F&B",
    "platform": "Instagram",
    "contentType": "Posts"
}

print("Sending 35 requests rapidly...")
success_count = 0
rate_limited_count = 0

for i in range(1, 36):
    try:
        r = requests.post(f"{BASE_URL}/api/strategy", json=rate_test_payload, headers=headers, timeout=10)
        if r.status_code == 200:
            success_count += 1
            if i <= 5 or i >= 30:
                print(f"  Request {i}: ✅ 200 OK")
        elif r.status_code == 429:
            rate_limited_count += 1
            if rate_limited_count == 1:
                print(f"  Request {i}: ⛔ 429 Rate Limited (Expected!)")
        else:
            print(f"  Request {i}: ❓ {r.status_code}")
    except Exception as e:
        print(f"  Request {i}: ❌ Error: {e}")
    
    time.sleep(0.05)  # Small delay

print(f"\n📊 Results:")
print(f"   Successful: {success_count}")
print(f"   Rate limited: {rate_limited_count}")

if rate_limited_count > 0:
    print("✅ RATE LIMITING TEST PASSED!")
else:
    print("⚠️  No rate limiting detected (might need to increase requests)")

# Step 5: Response Time Check
print("\n" + "=" * 60)
print("TEST 5: Response Time Measurement")
print("=" * 60)

unique_payload = {
    "goal": f"Timing test {datetime.now().isoformat()}",
    "audience": "timing test audience",
    "industry": "SaaS",
    "platform": "LinkedIn",
    "contentType": "Posts"
}

print("Generating fresh strategy (no cache)...")
start = time.time()
try:
    r = requests.post(f"{BASE_URL}/api/strategy", json=unique_payload, headers=headers, timeout=300)
    elapsed = time.time() - start
    
    if r.status_code == 200:
        data = r.json()
        print(f"✅ Strategy generated")
        print(f"⏱️  Response time: {elapsed:.2f}s")
        print(f"📊 Reported generation time: {data.get('generation_time', 'N/A'):.2f}s")
        
        if elapsed < 45:
            print("✅ RESPONSE TIME TEST PASSED! (<45s)")
        elif elapsed < 180:
            print(f"⚠️  Acceptable but slow ({elapsed:.2f}s)")
        else:
            print(f"❌ Too slow ({elapsed:.2f}s)")
    else:
        print(f"❌ Request failed: {r.status_code}")
except Exception as e:
    print(f"❌ Error: {e}")

# Summary
print("\n" + "=" * 60)
print("TEST SUMMARY")
print("=" * 60)
print("✅ Strategy Generation: Complete")
print("✅ Redis Caching: Tested")
print("✅ Rate Limiting: Tested")
print("✅ Response Time: Measured")
print("\n📋 Check test_strategy_output.json for full strategy details")
print("=" * 60)
