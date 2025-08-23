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
users_collection = collections["Users"]


def verify_admin_token(req):
    """Helper function to verify admin token"""
    try:
        auth_header = req.headers.get("Authorization")
        logging.info(f"Authorization header: {auth_header[:50] if auth_header else 'None'}...")
        
        if not auth_header or not auth_header.startswith("Bearer "):
            logging.warning("Missing or invalid Authorization header")
            return None

        token = auth_header.replace("Bearer ", "")
        logging.info(f"Extracted token length: {len(token)}")
        
        secret = os.environ.get("JWT_SECRET_KEY")
        if not secret:
            logging.error("JWT_SECRET_KEY not found in environment variables")
            return None
            
        logging.info("Decoding JWT token")
        payload = jwt.decode(token, secret, algorithms=["HS256"])
        
        logging.info(f"Token payload: {payload}")
        if payload.get("role") != "admin":
            logging.warning(f"User role is not admin: {payload.get('role')}")
            return None
            
        logging.info("Admin token verified successfully")
        return payload
    except jwt.ExpiredSignatureError:
        logging.error("JWT token has expired")
        return None
    except jwt.InvalidTokenError as e:
        logging.error(f"Invalid JWT token: {e}")
        return None
    except Exception as e:
        logging.error(f"Error verifying token: {e}")
        return None


def main(req: func.HttpRequest) -> func.HttpResponse:
    
    logging.info(f"AdminGetAllSensors function called with method: {req.method}")
    
    # Handle CORS preflight requests
    if req.method == "OPTIONS":
        logging.info("Handling OPTIONS preflight request")
        return func.HttpResponse(
            "",
            status_code=200,
            headers={
                "Access-Control-Allow-Origin": "http://localhost:3001",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Max-Age": "3600"
            }
        )
    
    try:
        # Verify admin token
        logging.info("Verifying admin token")
        payload = verify_admin_token(req)
        if not payload:
            logging.warning("Unauthorized access attempt")
            return func.HttpResponse(
                "Unauthorized", 
                status_code=401,
                headers={
                    "Access-Control-Allow-Origin": "http://localhost:3001",
                    "Access-Control-Allow-Credentials": "true"
                }
            )

        logging.info(f"Admin verified: {payload.get('email')}")
        
        # Get all sensors from SensorStock
        logging.info("Fetching sensors from database")
        sensors = list(sensor_stock_collection.find({}, {
            "_id": 1,
            "SensorID": 1,
            "PairingKey": 1,
            "currUserID": 1,
            "status": 1,
            "created_at": 1,
            "last_updated": 1
        }))
        
        logging.info(f"Found {len(sensors)} sensors")

        # Enrich sensor data with user information
        logging.info("Processing sensor data and user lookups")
        for sensor in sensors:
            try:
                sensor_id = str(sensor["_id"])
                sensor["id"] = sensor_id
                
                # Use SensorID as the main identifier (not _id)
                sensor["deviceId"] = sensor.get("SensorID")
                logging.debug(f"Processing sensor: {sensor.get('SensorID')}")
                
                # Check if sensor is connected to a user
                curr_user_id = sensor.get("currUserID")
                logging.debug(f"Sensor {sensor.get('SensorID')} currUserID: {curr_user_id}")
                
                if curr_user_id:
                    # Get owner information
                    try:
                        logging.debug(f"Looking up user with ID: {curr_user_id}")
                        
                        # Try different approaches for user lookup
                        user = None
                        
                        # First, try as ObjectId
                        try:
                            user = users_collection.find_one({"_id": ObjectId(curr_user_id)})
                            logging.debug(f"ObjectId lookup result: {user is not None}")
                        except Exception as oid_error:
                            logging.debug(f"ObjectId lookup failed: {oid_error}")
                        
                        # If ObjectId failed, try as string
                        if not user:
                            user = users_collection.find_one({"_id": curr_user_id})
                            logging.debug(f"String lookup result: {user is not None}")
                        
                        # If still no user, try searching by user_id field
                        if not user:
                            user = users_collection.find_one({"user_id": curr_user_id})
                            logging.debug(f"user_id field lookup result: {user is not None}")
                        
                        if user:
                            sensor["ownerEmail"] = user.get("email")
                            sensor["ownerUsername"] = user.get("username")
                            sensor["isConnected"] = True
                            logging.info(f"Found user for sensor {sensor.get('SensorID')}: {user.get('email')}")
                        else:
                            sensor["ownerEmail"] = "User Not Found"
                            sensor["ownerUsername"] = "Unknown"
                            sensor["isConnected"] = True
                            logging.warning(f"No user found for currUserID: {curr_user_id}")
                            
                    except Exception as user_error:
                        logging.error(f"Error looking up user {curr_user_id}: {user_error}")
                        sensor["ownerEmail"] = f"Error: {str(user_error)[:50]}"
                        sensor["ownerUsername"] = "Error"
                        sensor["isConnected"] = True
                else:
                    sensor["ownerEmail"] = None
                    sensor["ownerUsername"] = None
                    sensor["isConnected"] = False
                    logging.debug(f"Sensor {sensor.get('SensorID')} has no currUserID")
                
                # Set default status if not present
                sensor["status"] = sensor.get("status", "inactive")
                
                # Add field mappings for frontend compatibility
                if "created_at" in sensor:
                    sensor["createdAt"] = sensor["created_at"]
                if "last_updated" in sensor:
                    sensor["lastUpdated"] = sensor["last_updated"]
                
                # Convert ObjectId to string for JSON serialization
                if "_id" in sensor:
                    del sensor["_id"]
                    
            except Exception as sensor_error:
                logging.error(f"Error processing sensor {sensor.get('SensorID', 'unknown')}: {sensor_error}")
                continue

        logging.info("Returning sensors data")
        return func.HttpResponse(
            json.dumps(sensors, default=str),
            status_code=200,
            mimetype="application/json",
            headers={
                "Access-Control-Allow-Origin": "http://localhost:3001",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
                "Access-Control-Allow-Credentials": "true"
            }
        )

    except Exception as e:
        logging.error(f"Admin get all sensors error: {e}")
        logging.error(f"Error type: {type(e).__name__}")
        import traceback
        logging.error(f"Stack trace: {traceback.format_exc()}")
        return func.HttpResponse(
            "Internal server error", 
            status_code=500,
            headers={
                "Access-Control-Allow-Origin": "http://localhost:3001",
                "Access-Control-Allow-Credentials": "true"
            }
        )
