# /futureGardens/{gardenId}  PATCH
import azure.functions as func
import json, logging
from datetime import datetime
from bson import ObjectId
from ..shared.utils import get_user_id_from_token, get_db_collections

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("updateFutureGarden triggered")
    auth = req.headers.get("Authorization","")
    if not auth.startswith("Bearer "): return func.HttpResponse("Unauthorized", status_code=401)

    try:
        user_oid = ObjectId(get_user_id_from_token(auth.split(" ")[1]))
    except Exception:
        return func.HttpResponse("Unauthorized", status_code=401)

    garden_id = req.route_params.get("gardenId")
    try:
        gid = ObjectId(garden_id)
    except Exception:
        return func.HttpResponse("Invalid id", status_code=400)

    try:
        payload = req.get_json()  # e.g. {criteria: {...}} or {plan: {...}} or {metadata: {...}, title: "..."}
        if not isinstance(payload, dict):
            return func.HttpResponse("Invalid body", status_code=400)

        # whitelist top-level fields you allow editing
        allowed = {k: v for k, v in payload.items() if k in ["criteria", "plan", "metadata", "title", "notes"]}
        if not allowed:
            return func.HttpResponse("No updatable fields", status_code=400)
        allowed["updatedAt"] = datetime.utcnow()

        col = get_db_collections()["FutureGardens"]
        res = col.update_one({"_id": gid, "userId": user_oid}, {"$set": allowed})
        if res.matched_count == 0:
            return func.HttpResponse("Not found", status_code=404)

        return func.HttpResponse(status_code=204)
    except Exception as e:
        logging.error(f"Error updating garden: {e}")
        return func.HttpResponse("Internal server error", status_code=500)
