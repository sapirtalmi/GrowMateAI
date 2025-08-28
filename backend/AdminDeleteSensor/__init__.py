from ..shared.utils import get_db_collections
import azure.functions as func
import logging
import json
import os
import jwt
from bson import ObjectId


# MongoDB setup
collections = get_db_collections()
sensor_stock_collection = collections["SensorStock"]
user_plants_collection = collections["UserPlants"]
sensor_reading_collection = collections["SensorReading"]


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


def main(req: func.HttpRequest) -> func.HttpResponse:
    
    try:
        # Verify admin token
        payload = verify_admin_token(req)
        if not payload:
            return func.HttpResponse("Unauthorized", status_code=401)

        # Get sensor ID from URL path
        sensor_id = req.route_params.get('sensorId')
        if not sensor_id:
            return func.HttpResponse("Missing sensor ID", status_code=400)

        try:
            # Check if sensor exists
            sensor = sensor_stock_collection.find_one({"_id": ObjectId(sensor_id)})
            if not sensor:
                return func.HttpResponse("Sensor not found", status_code=404)

            device_id = sensor.get("deviceId")
            
            # Remove sensor from any plants that are using it
            user_plants_collection.update_many(
                {"sensor_id": device_id},
                {"$unset": {"sensor_id": ""}}
            )
            
            # Delete sensor readings for this device
            sensor_reading_collection.delete_many({"device_id": device_id})
            
            # Delete the sensor from stock
            result = sensor_stock_collection.delete_one({"_id": ObjectId(sensor_id)})
            
            if result.deleted_count == 0:
                return func.HttpResponse("Failed to delete sensor", status_code=500)
                
        except Exception as e:
            logging.error(f"Error deleting sensor: {e}")
            return func.HttpResponse("Error deleting sensor", status_code=500)

        return func.HttpResponse(
            json.dumps({"success": True, "message": "Sensor deleted successfully"}),
            status_code=200,
            mimetype="application/json",
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            }
        )

    except Exception as e:
        logging.error(f"Admin delete sensor error: {e}")
        return func.HttpResponse("Internal server error", status_code=500)
