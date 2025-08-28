from ..shared.utils import get_db_collections
import azure.functions as func
import logging
import json
import os
import jwt
from bson import ObjectId


# MongoDB setup
collections = get_db_collections()
hazards_collection = collections["Hazards"]


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
    
    logging.info(f"AdminGetAllHazards function called with method: {req.method}")
    
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
        
        # Get all hazards from the database
        logging.info("Fetching all hazards from database")
        hazards = list(hazards_collection.find(
            {},  # No filter - get all hazards
            {
                "_id": 1,
                "type": 1,
                "description": 1,
                "latitude": 1,
                "longitude": 1,
                "severity": 1,
                "status": 1,
                "reported_by": 1,
                "created_at": 1,
                "verified": 1,
                "reports_count": 1,
                "last_updated": 1
            }
        ))
        
        logging.info(f"Found {len(hazards)} hazards")

        # Process hazards data
        logging.info("Processing hazards data")
        for hazard in hazards:
            try:
                hazard["id"] = str(hazard["_id"])
                hazard["status"] = hazard.get("status", "active")  # Default to active if not set
                
                # Ensure we have proper field names for frontend compatibility
                if "created_at" in hazard:
                    hazard["createdAt"] = hazard["created_at"]
                if "reported_by" in hazard:
                    hazard["reportedBy"] = hazard["reported_by"]
                if "reports_count" in hazard:
                    hazard["reportsCount"] = hazard["reports_count"]
                if "last_updated" in hazard:
                    hazard["lastUpdated"] = hazard["last_updated"]
                
                # Convert ObjectId to string for JSON serialization
                if "_id" in hazard:
                    del hazard["_id"]
            except Exception as hazard_error:
                logging.error(f"Error processing hazard {hazard.get('_id', 'unknown')}: {hazard_error}")
                # Continue processing other hazards
                continue

        logging.info("Returning hazards data")
        return func.HttpResponse(
            json.dumps(hazards, default=str),
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
        logging.error(f"Admin get all hazards error: {e}")
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
