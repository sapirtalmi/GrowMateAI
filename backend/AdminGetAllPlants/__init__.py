from ..shared.utils import get_db_collections
import azure.functions as func
import logging
import json
import os
import jwt


# MongoDB setup
collections = get_db_collections()
user_plants_collection = collections["UserPlants"]


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

        # Get all plants
        plants = list(user_plants_collection.find({}))

        # Convert ObjectId to string for JSON serialization
        for plant in plants:
            plant["id"] = str(plant["_id"])
            if "_id" in plant:
                del plant["_id"]

        return func.HttpResponse(
            json.dumps(plants, default=str),
            status_code=200,
            mimetype="application/json",
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            }
        )

    except Exception as e:
        logging.error(f"Admin get all plants error: {e}")
        return func.HttpResponse("Internal server error", status_code=500)
