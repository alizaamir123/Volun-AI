#!/usr/bin/env python
"""Test CORS and admin API endpoints"""
import requests
import json
from urllib.parse import urljoin

base = 'http://localhost:8000'

print("=" * 80)
print("TESTING CORS & ADMIN API ENDPOINTS")
print("=" * 80)

try:
    # Step 1: Get auth token
    print("\n1. Getting admin auth token...")
    token_resp = requests.post(
        urljoin(base, '/api/v1/auth/access-token'),
        data={'username': 'admin@gmail.com', 'password': 'aliza123'}
    )
    print(f"   Status: {token_resp.status_code}")
    
    if token_resp.status_code != 200:
        print(f"   ERROR: {token_resp.text}")
        exit(1)
    
    token = token_resp.json()['access_token']
    print(f"   Token: {token[:20]}...")
    
    headers = {'Authorization': f'Bearer {token}'}
    
    # Step 2: Test overview endpoint
    print("\n2. Testing /api/v1/admin/analytics/overview")
    r = requests.get(urljoin(base, '/api/v1/admin/analytics/overview'), headers=headers)
    print(f"   Status: {r.status_code}")
    print(f"   CORS Header: {r.headers.get('access-control-allow-origin', 'NOT SET')}")
    if r.status_code == 200:
        data = r.json()
        print(f"   Data: {json.dumps(data, indent=2)[:300]}")
    else:
        print(f"   ERROR: {r.text[:200]}")
    
    # Step 3: Test pending-organizers endpoint
    print("\n3. Testing /api/v1/admin/pending-organizers")
    r = requests.get(urljoin(base, '/api/v1/admin/pending-organizers'), headers=headers)
    print(f"   Status: {r.status_code}")
    print(f"   CORS Header: {r.headers.get('access-control-allow-origin', 'NOT SET')}")
    if r.status_code == 200:
        data = r.json()
        print(f"   Data count: {len(data)}")
    else:
        print(f"   ERROR: {r.text[:200]}")
    
    # Step 4: Test detailed-analytics endpoint
    print("\n4. Testing /api/v1/admin/analytics/detailed")
    r = requests.get(urljoin(base, '/api/v1/admin/analytics/detailed'), headers=headers)
    print(f"   Status: {r.status_code}")
    print(f"   CORS Header: {r.headers.get('access-control-allow-origin', 'NOT SET')}")
    if r.status_code == 200:
        data = r.json()
        print(f"   Volunteers: {len(data.get('volunteers', []))}")
        print(f"   Monthly stats: {len(data.get('monthlyStats', []))}")
        print(f"   Sample data: {json.dumps(data, indent=2)[:500]}")
    else:
        print(f"   ERROR: {r.text[:500]}")
    
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 80)
