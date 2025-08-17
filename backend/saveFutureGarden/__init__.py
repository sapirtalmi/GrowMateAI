import azure.functions as func
import logging
import json
from datetime import datetime
from bson import ObjectId
from ..shared.utils import get_user_id_from_token, get_db_collections

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("saveFutureGarden triggered")

    token = req.headers.get("Authorization", "").replace("Bearer ", "")
    try:
        user_id = get_user_id_from_token(token)
        user_object_id = ObjectId(user_id)
    except Exception:
        return func.HttpResponse("Unauthorized", status_code=401)

    try:
        data = req.get_json()
        plan = data.get("plan")
        if not plan:
            return func.HttpResponse("Missing plan data", status_code=400)

        collections = get_db_collections()
        garden_doc = {
            "userid": str(user_object_id),
            "plan": plan,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        result = collections["FutureGardens"].insert_one(garden_doc)
        garden_doc["_id"] = str(result.inserted_id)
        garden_doc["userId"] = str(user_object_id)
        garden_doc["createdAt"] = garden_doc["createdAt"].isoformat()
        garden_doc["updatedAt"] = garden_doc["updatedAt"].isoformat()

        return func.HttpResponse(
            json.dumps(garden_doc),
            status_code=201,
            mimetype="application/json"
        )
    except Exception as e:
        logging.error(f"Error saving garden: {e}")
        return func.HttpResponse("Internal server error", status_code=500)
