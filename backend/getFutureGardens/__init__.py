import azure.functions as func
import logging
import json
from bson import ObjectId
from ..shared.utils import get_user_id_from_token, get_db_collections

collections = get_db_collections()
gardens_collection = collections["FutureGardens"]
users_collection = collections["Users"]

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("getFutureGardens function triggered")

    auth = req.headers.get("Authorization")
    if not auth or not auth.startswith("Bearer "):
        return func.HttpResponse("Missing or invalid Authorization header", status_code=401)

    try:
        token = auth.split(" ")[1]
        user_id = get_user_id_from_token(token)
        user_object_id = ObjectId(user_id)  
    except Exception as e:
        logging.error(f"Token/ObjectId error: {e}")
        return func.HttpResponse("Invalid or expired token", status_code=401)

    try:
        gardens_cursor = gardens_collection.find(
            {"userId": user_object_id}
        ).sort("_id", -1)

        user_doc = users_collection.find_one(
            {"_id": user_object_id},
            {"username": 1, "profileType": 1}
        )

        future_gardens = []
        for g in gardens_cursor:
            g["_id"] = str(g["_id"])
            g["userId"] = str(g["userId"])
            if "createdAt" in g and hasattr(g["createdAt"], "isoformat"):
                g["createdAt"] = g["createdAt"].isoformat()
            if "updatedAt" in g and hasattr(g["updatedAt"], "isoformat"):
                g["updatedAt"] = g["updatedAt"].isoformat()
            g["username"] = (user_doc or {}).get("username", "Unknown")
            g["profileType"] = (user_doc or {}).get("profileType", "N/A")
            future_gardens.append(g)

        return func.HttpResponse(json.dumps(future_gardens),
                                 status_code=200,
                                 mimetype="application/json")
    except Exception as e:
        logging.exception("Unhandled error retrieving saved gardens")
        return func.HttpResponse("Internal server error", status_code=500)
