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

    auth = req.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return func.HttpResponse("Missing or invalid Authorization header", status_code=401)

    try:
        user_id = get_user_id_from_token(auth.split(" ")[1])
        user_oid = ObjectId(user_id)
        logging.info(f"Querying FutureGardens for userId={user_oid}")
    except Exception as e:
        logging.error(f"Token/ObjectId error: {e}")
        return func.HttpResponse("Invalid or expired token", status_code=401)

    try:
        # sort by _id (indexed) to avoid Cosmos index issues
        cursor = gardens_collection.find({"userId": user_oid}).sort("_id", -1)

        # Optional: count for logs
        docs = list(cursor)
        logging.info(f"Found {len(docs)} future gardens for userId={user_oid}")

        # get user info once
        user_doc = users_collection.find_one(
            {"_id": user_oid}, {"username": 1, "profileType": 1}
        ) or {}

        result = []
        for g in docs:
            g["_id"] = str(g["_id"])
            g["userId"] = str(g["userId"])
            if "createdAt" in g and hasattr(g["createdAt"], "isoformat"):
                g["createdAt"] = g["createdAt"].isoformat()
            if "updatedAt" in g and hasattr(g["updatedAt"], "isoformat"):
                g["updatedAt"] = g["updatedAt"].isoformat()
            g["username"] = user_doc.get("username", "Unknown")
            g["profileType"] = user_doc.get("profileType", "N/A")
            result.append(g)

        # Important: never return 404 for a list – return an empty array
        return func.HttpResponse(json.dumps(result), status_code=200, mimetype="application/json")

    except Exception as e:
        logging.exception("Unhandled error retrieving saved gardens")
        return func.HttpResponse("Internal server error", status_code=500)
