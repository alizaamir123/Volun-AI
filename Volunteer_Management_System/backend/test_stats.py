import requests

# Test the dashboard stats endpoint
response = requests.get('http://localhost:8000/api/v1/organizer/dashboard-stats', headers={'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2Iiwicm9sZSI6Im9yZ2FuaXplciIsImV4cCI6MTc0MDY4MzY4MH0.example_token'})
if response.status_code == 200:
    data = response.json()
    print('Dashboard stats for organizer ID 6:')
    print(f'  Total Events: {data["total_events"]}')
    print(f'  Active Events: {data["active_events"]}')
    print(f'  Pending Events: {data["pending_events"]}')
    print(f'  Total Applications: {data["total_applications"]}')
else:
    print(f'Error: {response.status_code} - {response.text}')