# createHazard API Test Examples

# Example 1: Create a weather-related hazard
POST /api/createHazard
Headers: {
    "Authorization": "Bearer <jwt_token>",
    "Content-Type": "application/json"
}
Body: {
    "latitude": 32.0853,
    "longitude": 34.7818,
    "type": "frost",
    "description": "Sudden temperature drop expected tonight. Protect sensitive plants."
}

# Example 2: Create a pest-related hazard
POST /api/createHazard
Headers: {
    "Authorization": "Bearer <jwt_token>",
    "Content-Type": "application/json"
}
Body: {
    "latitude": 31.7683,
    "longitude": 35.2137,
    "type": "aphids",
    "description": "Large aphid infestation spotted on tomato plants in community garden",
    "severity": "high"
}

# Example 3: Create environmental hazard
POST /api/createHazard
Headers: {
    "Authorization": "Bearer <jwt_token>",
    "Content-Type": "application/json"
}
Body: {
    "latitude": 32.1,
    "longitude": 34.8,
    "type": "pesticide",
    "description": "Pesticide spraying scheduled for tomorrow morning. Cover crops and stay away.",
    "severity": "medium"
}

# Success Response (201):
{
    "id": "64f1234567890abcdef12345",
    "type": "frost",
    "description": "Sudden temperature drop expected tonight. Protect sensitive plants.",
    "latitude": 32.0853,
    "longitude": 34.7818,
    "reported_by": "user_id_123",
    "created_at": "2025-08-17T10:30:45.123Z",
    "status": "active",
    "message": "Hazard created successfully"
}

# Error Responses:
# 400 - Missing required fields
# 401 - Invalid or missing authorization
# 500 - Server error
