import azure.functions as func
import logging
import json
from bson import ObjectId
from bson.errors import InvalidId
from ..shared.utils import get_user_id_from_token, get_db_collections

collections = get_db_collections()
gardens_collection = collections["FutureGardens"]
users_collection = collections["Users"]

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("getFutureGardens function triggered")

    auth_header = req.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return func.HttpResponse("Missing or invalid Authorization header", status_code=401)

    token = auth_header.split(" ")[1]
    try:
        user_id = get_user_id_from_token(token)
        user_object_id = ObjectId(user_id)
    except Exception as e:
        logging.error(f"Token validation or ObjectId conversion failed: {e}")
        return func.HttpResponse("Invalid or expired token", status_code=401)

    try:
        gardens_cursor = gardens_collection.find({ "userid": user_id }).sort("createdAt", -1)

        user_doc = users_collection.find_one(
            { "_id": user_object_id },
            { "username": 1, "profileType": 1 }
        )

        future_gardens = []
        for garden in gardens_cursor:
            try:
                garden["_id"] = str(garden["_id"])
                garden["userId"] = str(garden["userId"])  # <- This line is critical!
                garden["createdAt"] = garden["createdAt"].isoformat() if "createdAt" in garden else None
                garden["updatedAt"] = garden["updatedAt"].isoformat() if "updatedAt" in garden else None
                garden["username"] = user_doc.get("username", "Unknown") if user_doc else "Unknown"
                garden["profileType"] = user_doc.get("profileType", "N/A") if user_doc else "N/A"
                future_gardens.append(garden)
            except Exception as e:
                logging.error(f"Failed to serialize garden {garden.get('_id')}: {e}")
                raise e

        return func.HttpResponse(
            json.dumps(future_gardens),
            status_code=200,
            mimetype="application/json"
        )

    except Exception as e:
        logging.exception("Unhandled error retrieving saved gardens")
        return func.HttpResponse("Internal server error", status_code=500)
