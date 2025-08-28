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

        # Get hazard ID from URL path
        hazard_id = req.route_params.get('hazardId')
        if not hazard_id:
            return func.HttpResponse("Missing hazard ID", status_code=400)

        try:
            # Delete the hazard
            result = hazards_collection.delete_one({"_id": ObjectId(hazard_id)})
            
            if result.deleted_count == 0:
                return func.HttpResponse("Hazard not found", status_code=404)
                
        except Exception as e:
            logging.error(f"Error deleting hazard: {e}")
            return func.HttpResponse("Error deleting hazard", status_code=500)

        return func.HttpResponse(
            json.dumps({"success": True, "message": "Hazard deleted successfully"}),
            status_code=200,
            mimetype="application/json",
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "DELETE, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            }
        )

    except Exception as e:
        logging.error(f"Admin delete hazard error: {e}")
        return func.HttpResponse("Internal server error", status_code=500)
