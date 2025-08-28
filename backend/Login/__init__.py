from ..shared.utils import generate_jwt, get_db_collections
import azure.functions as func
import logging
import bcrypt
import json


# MongoDB setup
collections = get_db_collections()
users_collection = collections["Users"]


def main(req: func.HttpRequest) -> func.HttpResponse:
    
    try:
        req_body = req.get_json()
        username = req_body.get("username")
        password = req_body.get("password")

        if not username or not password:
            return func.HttpResponse("Missing username or password", status_code=400)

        user = users_collection.find_one({"username": username})
        
        if not user:
            return func.HttpResponse("User not found", status_code=401)

        hashed_pw = user.get("hashed_password")

        if not hashed_pw:
            return func.HttpResponse("Password not set for user", status_code=500)

        # Ensure hashed_pw is bytes
        if isinstance(hashed_pw, str):
            hashed_pw = hashed_pw.encode("utf-8")

        if not bcrypt.checkpw(password.encode("utf-8"), hashed_pw):
            return func.HttpResponse("Invalid password", status_code=401)
        

        payload = {
            "username": username,
            "user_id": str(user["_id"])
        }
        token = generate_jwt(payload)

        return func.HttpResponse(
            json.dumps({
                "token": token,
                "user_id": str(user["_id"])
            }),
            status_code=200,
            mimetype="application/json"
        )

    except Exception as e:
        logging.error(f"Login error: {e}")
        return func.HttpResponse("Internal server error", status_code=500)
