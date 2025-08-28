from ..shared.utils import get_db_collections
import azure.functions as func
import logging
import json
import os
import jwt
from bson import ObjectId


# MongoDB setup
collections = get_db_collections()
users_collection = collections["Users"]
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

        # Get user ID from URL path
        user_id = req.route_params.get('userId')
        if not user_id:
            return func.HttpResponse("Missing user ID", status_code=400)

        try:
            # Check if user exists and is not admin
            user = users_collection.find_one({"_id": ObjectId(user_id)})
            if not user:
                return func.HttpResponse("User not found", status_code=404)
            
            if user.get("role") == "admin":
                return func.HttpResponse("Cannot delete admin users", status_code=403)

            # Delete user's plants
            user_plants_collection.delete_many({"user_id": user_id})
            
            # Delete user's sensor readings
            sensor_reading_collection.delete_many({"user_id": user_id})
            
            # Delete the user
            result = users_collection.delete_one({"_id": ObjectId(user_id)})
            
            if result.deleted_count == 0:
                return func.HttpResponse("Failed to delete user", status_code=500)
                
        except Exception as e:
            logging.error(f"Error deleting user: {e}")
            return func.HttpResponse("Error deleting user", status_code=500)

        return func.HttpResponse(
            json.dumps({"success": True, "message": "User deleted successfully"}),
            status_code=200,
            mimetype="application/json",
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            }
        )

    except Exception as e:
        logging.error(f"Admin delete user error: {e}")
        return func.HttpResponse("Internal server error", status_code=500)
