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

        # Get status from request body
        req_body = req.get_json()
        status = req_body.get("status")
        
        if not status or status not in ["active", "inactive", "banned"]:
            return func.HttpResponse("Invalid status. Must be 'active', 'inactive', or 'banned'", status_code=400)

        # Update user status
        try:
            result = users_collection.update_one(
                {"_id": ObjectId(user_id), "role": {"$ne": "admin"}},  # Don't allow updating admin users
                {"$set": {"status": status}}
            )
            
            if result.matched_count == 0:
                return func.HttpResponse("User not found or is admin", status_code=404)
                
        except Exception as e:
            logging.error(f"Error updating user status: {e}")
            return func.HttpResponse("Error updating user status", status_code=500)

        return func.HttpResponse(
            json.dumps({"success": True, "message": f"User status updated to {status}"}),
            status_code=200,
            mimetype="application/json",
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "PUT, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            }
        )

    except Exception as e:
        logging.error(f"Admin update user status error: {e}")
        return func.HttpResponse("Internal server error", status_code=500)
