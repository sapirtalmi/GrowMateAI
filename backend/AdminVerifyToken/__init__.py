from ..shared.utils import get_user_id_from_token, get_db_collections
import azure.functions as func
import logging
import json
import os
import jwt


# MongoDB setup
collections = get_db_collections()
users_collection = collections["Users"]


def main(req: func.HttpRequest) -> func.HttpResponse:
    
    try:
        # Get authorization header
        auth_header = req.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return func.HttpResponse("Missing or invalid authorization header", status_code=401)

        # Extract token
        token = auth_header.replace("Bearer ", "")
        
        # Verify token and extract payload
        try:
            secret = os.environ.get("JWT_SECRET_KEY")
            payload = jwt.decode(token, secret, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return func.HttpResponse("Token expired", status_code=401)
        except jwt.InvalidTokenError:
            return func.HttpResponse("Invalid token", status_code=401)

        # Check if user has admin role
        if payload.get("role") != "admin":
            return func.HttpResponse("Insufficient privileges", status_code=403)

        # Get user from database to ensure they still exist and are admin
        user_id = payload.get("user_id")
        admin_user = users_collection.find_one({
            "_id": user_id,
            "role": "admin"
        })
        
        if not admin_user:
            return func.HttpResponse("Admin user not found", status_code=401)

        return func.HttpResponse(
            json.dumps({
                "valid": True,
                "user": {
                    "id": str(admin_user["_id"]),
                    "email": admin_user.get("email"),
                    "name": admin_user.get("username", admin_user.get("email")),
                    "role": "admin"
                }
            }),
            status_code=200,
            mimetype="application/json",
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
            }
        )

    except Exception as e:
        logging.error(f"Admin token verification error: {e}")
        return func.HttpResponse("Internal server error", status_code=500)
