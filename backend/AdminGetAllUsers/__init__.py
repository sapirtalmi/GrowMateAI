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
    
    logging.info(f"AdminGetAllUsers function called with method: {req.method}")
    
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
        
        # Get all users (exclude admin users and sensitive data)
        logging.info("Fetching users from database")
        users = list(users_collection.find(
            {"role": {"$ne": "admin"}},  # Exclude admin users
            {
                "_id": 1,
                "username": 1,
                "email": 1,
                "createdAt": 1,
                "lastLogin": 1,
                "status": 1,
                "role": 1
                # Note: hashed_password is excluded by not including it
            }
        ))
        
        logging.info(f"Found {len(users)} users")

        logging.info(f"Found {len(users)} users")

        # Get plant count for each user
        logging.info("Processing user data and plant counts")
        for user in users:
            try:
                user_id = str(user["_id"])
                logging.debug(f"Processing user: {user_id}")
                plant_count = user_plants_collection.count_documents({"user_id": user_id})
                user["plantCount"] = plant_count
                user["id"] = user_id
                user["status"] = user.get("status", "active")  # Default to active if not set
                
                # Convert ObjectId to string for JSON serialization
                if "_id" in user:
                    del user["_id"]
            except Exception as user_error:
                logging.error(f"Error processing user {user.get('_id', 'unknown')}: {user_error}")
                # Continue processing other users
                continue

        logging.info("Returning users data")
        return func.HttpResponse(
            json.dumps(users, default=str),
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
        logging.error(f"Admin get all users error: {e}")
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
