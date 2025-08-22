# /saveFutureGarden  POST
import azure.functions as func
import json, logging
from datetime import datetime
from bson import ObjectId
from ..shared.utils import get_user_id_from_token, get_db_collections

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("saveFutureGarden triggered")
    token = req.headers.get("Authorization","").replace("Bearer ","")
    try:
        user_object_id = ObjectId(get_user_id_from_token(token))
    except Exception:
        return func.HttpResponse("Unauthorized", status_code=401)

    try:
        body = req.get_json()  # expects {criteria, plan, metadata}
        if not isinstance(body, dict) or "plan" not in body:
            return func.HttpResponse("Body must include 'plan'", status_code=400)

        doc = {
            "userId": user_object_id,
            "criteria": body.get("criteria", {}),
            "plan": body["plan"],
            "metadata": body.get("metadata", {}),
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow(),
        }

        col = get_db_collections()["FutureGardens"]
        res = col.insert_one(doc)

        # serialize
        doc["_id"] = str(res.inserted_id)
        doc["userId"] = str(user_object_id)
        doc["createdAt"] = doc["createdAt"].isoformat()
        doc["updatedAt"] = doc["updatedAt"].isoformat()
        return func.HttpResponse(json.dumps(doc), status_code=201, mimetype="application/json")
    except Exception as e:
        logging.error(f"Error saving garden: {e}")
        return func.HttpResponse("Internal server error", status_code=500)
