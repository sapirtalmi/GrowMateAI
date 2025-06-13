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

        if not username or not password:
            return func.HttpResponse("Missing username or password", status_code=400)

        # Check if user already exists
        if users_collection.find_one({"username": username}):
            return func.HttpResponse("Username already exists", status_code=409)

        # Hash the password
        salt = bcrypt.gensalt()
        hashed_pw = bcrypt.hashpw(password.encode("utf-8"), salt)

        # Create user document
        user_doc = {
            "username": username,
            "hashed_password": hashed_pw,
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
