from ..shared.utils import generate_jwt, get_db_collections
import azure.functions as func
import logging
import bcrypt
import json

collections = get_db_collections()
users_collection = collections["Users"]

def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        req_body = req.get_json()
        username = req_body.get("username")
        password = req_body.get("password")
        email = req_body.get("email")
        accept_email_notifications = req_body.get("acceptEmailNotifications")

        if not username or not password or not email:
            return func.HttpResponse("Missing username, password, or email", status_code=400)

        # Check if user already exists
        if users_collection.find_one({"username": username}):
            return func.HttpResponse("Username already exists", status_code=409)

        # Hash the password
        salt = bcrypt.gensalt()
        hashed_pw = bcrypt.hashpw(password.encode("utf-8"), salt)

        # Define allowed profile types
        allowed_profiles = ["amateur", "enthusiast", "professional", "nursery_owner"]
        # Get profile type from request, default to "amateur"
        profile_type = req_body.get("profileType", "amateur")
        if profile_type not in allowed_profiles:
            profile_type = "amateur"  # default fallback


        # Create user document with initial profile
        user_doc = {
            "username": username,
            "hashed_password": hashed_pw,
            "email": email,
            "acceptEmailNotifications": bool(accept_email_notifications),
            "profileType": profile_type,
            "reputationScore": 0,
            "postsCount": 0,
            "commentsCount": 0,
            "votesReceived": 0,
            "badges": ["Early Adopter"]
        }


        result = users_collection.insert_one(user_doc)

        # Generate JWT
        payload = {
            "username": username,
            "user_id": str(result.inserted_id),
        }
        token = generate_jwt(payload)

        return func.HttpResponse(
            json.dumps({"token": token}),
            status_code=201,
            mimetype="application/json"
        )

    except Exception as e:
        logging.error(f"Registration error: {e}")
        return func.HttpResponse("Internal server error", status_code=500)
