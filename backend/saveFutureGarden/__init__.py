import azure.functions as func
import logging
import json
import uuid
from datetime import datetime
from ..shared.utils import get_user_id_from_token, get_db_collections  

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("saveFutureGarden triggered")

    token = req.headers.get("Authorization", "").replace("Bearer ", "")
    try:
        user_id = get_user_id_from_token(token)
    except Exception as e:
        return func.HttpResponse("Unauthorized", status_code=401)

    try:
        data = req.get_json()
        plan = data.get("plan")
        if not plan:
            return func.HttpResponse("Missing plan data", status_code=400)

        collections = get_db_collections()
        garden_doc = {
            "_id": str(uuid.uuid4()),
            "userId": user_id,
            "plan": plan,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
        collections["FutureGardens"].insert_one(garden_doc)

        garden_doc["_id"] = str(garden_doc["_id"])  # stringify ID if needed
        return func.HttpResponse(json.dumps(garden_doc), status_code=201, mimetype="application/json")

    except Exception as e:
        logging.error(f"Error saving garden: {e}")
        return func.HttpResponse("Internal server error", status_code=500)
