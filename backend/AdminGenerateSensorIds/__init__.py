from ..shared.utils import get_db_collections
import azure.functions as func
import logging
import json
import os
import jwt
import uuid
import random
import string
from datetime import datetime


# MongoDB setup
collections = get_db_collections()
sensor_stock_collection = collections["SensorStock"]


def verify_admin_token(req):
    """Helper function to verify admin token"""
    auth_header = req.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return None

    token = auth_header.replace("Bearer ", "")
    try:
        secret = os.environ.get("JWT_SECRET_KEY")
        payload = jwt.decode(token, secret, algorithms=["HS256"])
        if payload.get("role") != "admin":
            return None
        return payload
    except:
        return None


def generate_sensor_id():
    """Generate a unique sensor ID"""
    # Format: SENSOR_XXXXXX (where X is alphanumeric)
    random_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"SENSOR_{random_part}"


def main(req: func.HttpRequest) -> func.HttpResponse:
    
    try:
        # Verify admin token
        payload = verify_admin_token(req)
        if not payload:
            return func.HttpResponse("Unauthorized", status_code=401)

        # Get count from request body
        req_body = req.get_json()
        count = req_body.get("count", 1)
        
        if not isinstance(count, int) or count < 1 or count > 100:
            return func.HttpResponse("Count must be an integer between 1 and 100", status_code=400)

        generated_sensors = []
        
        for _ in range(count):
            # Generate unique sensor ID
            sensor_id = generate_sensor_id()
            
            # Ensure uniqueness
            while sensor_stock_collection.find_one({"deviceId": sensor_id}):
                sensor_id = generate_sensor_id()
            
            # Create sensor document
            sensor_doc = {
                "deviceId": sensor_id,
                "status": "inactive",  # Default status
                "createdAt": datetime.utcnow(),
                "createdBy": payload.get("email", "admin"),
                "batteryLevel": 100,  # Default battery level
                "firmwareVersion": "1.0.0",  # Default firmware
                "lastDataReceived": None
            }
            
            # Insert into database
            sensor_stock_collection.insert_one(sensor_doc)
            generated_sensors.append(sensor_id)
            
            logging.info(f"Generated sensor ID: {sensor_id}")

        return func.HttpResponse(
            json.dumps({
                "success": True,
                "count": len(generated_sensors),
                "sensorIds": generated_sensors
            }),
            status_code=200,
            mimetype="application/json",
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            }
        )

    except Exception as e:
        logging.error(f"Admin generate sensor IDs error: {e}")
        return func.HttpResponse("Internal server error", status_code=500)
