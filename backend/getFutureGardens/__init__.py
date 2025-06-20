import azure.functions as func
import logging
import json
from bson import ObjectId
from ..shared.utils import get_user_id_from_token, get_db_collections


def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("getFutureGardens function triggered")

    auth_header = req.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return func.HttpResponse("Missing or invalid Authorization header", status_code=401)

    token = auth_header.split(" ")[1]
    try:
        user_id = get_user_id_from_token(token)
    except Exception as e:
        logging.error(f"Token validation failed: {str(e)}")
        return func.HttpResponse("Invalid or expired token", status_code=401)

    try:
        collections = get_db_collections()
        future_gardens_cursor = collections["FutureGardens"].find({"userId": user_id}).sort("createdAt", -1)

        future_gardens = []
        for garden in future_gardens_cursor:
            garden["_id"] = str(garden["_id"]) 
            future_gardens.append(garden)

        return func.HttpResponse(
            json.dumps(future_gardens),
            status_code=200,
            mimetype="application/json"
        )

    except Exception as e:
        logging.error(f"Error retrieving saved gardens: {str(e)}")
        return func.HttpResponse("Internal server error", status_code=500)
