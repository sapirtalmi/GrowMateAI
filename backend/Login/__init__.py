from ..shared.utils import generate_jwt, get_db_collections
import azure.functions as func
import logging
import bcrypt
import json
import traceback
from bson.binary import Binary




# MongoDB setup
collections = get_db_collections()
users_collection = collections["Users"]


def main(req: func.HttpRequest) -> func.HttpResponse:
    
    try:
        req_body = req.get_json()
        username = req_body.get("username")
        password = req_body.get("password")

        if not username or not password:
            return func.HttpResponse(
                json.dumps({"error": "Missing username or password"}),
                status_code=400,
                mimetype="application/json"
            )

        user = users_collection.find_one({"username": username})
        
        if not user:
            return func.HttpResponse(
                json.dumps({"error": "Invalid username or password"}),
                status_code=401,
                mimetype="application/json"
            )

        hashed_pw = user.get("hashed_password")

        if not hashed_pw:
            return func.HttpResponse(
                json.dumps({"error": "Password not set for user"}),
                status_code=500,
                mimetype="application/json"
            )


        # Ensure hashed_pw is bytes
        if isinstance(hashed_pw, Binary):
            hashed_pw = bytes(hashed_pw)
        elif isinstance(hashed_pw, str):
            hashed_pw = hashed_pw.encode("utf-8")

        if not bcrypt.checkpw(password.encode("utf-8"), hashed_pw):
            return func.HttpResponse(
                json.dumps({"error": "Invalid username or password"}),
                status_code=401,
                mimetype="application/json"
            )

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
        logging.error("Login error:\n" + traceback.format_exc())
        return func.HttpResponse(
            json.dumps({"error": "Internal server error"}),
            status_code=500,
            mimetype="application/json"
        )
