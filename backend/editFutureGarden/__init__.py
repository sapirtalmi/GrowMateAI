import azure.functions as func
import logging
from datetime import datetime
from bson import ObjectId
from ..shared.utils import get_user_id_from_token, get_db_collections

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("updateFutureGarden triggered")

    # ---- Auth ---------------------------------------------------------------
    auth = req.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return func.HttpResponse("Unauthorized", status_code=401)
    try:
        token = auth.split(" ")[1]
        user_oid = ObjectId(get_user_id_from_token(token))
    except Exception:
        return func.HttpResponse("Unauthorized", status_code=401)

    # ---- Params -------------------------------------------------------------
    garden_id = req.route_params.get("gardenId")
    try:
        gid = ObjectId(garden_id)
    except Exception:
        return func.HttpResponse("Invalid id", status_code=400)

    # ---- Payload ------------------------------------------------------------
    try:
        payload = req.get_json()
    except Exception:
        payload = None
    if not isinstance(payload, dict):
        return func.HttpResponse("Invalid body", status_code=400)

    allowed = {k: v for k, v in payload.items() if k in ["criteria", "plan", "metadata", "title", "notes"]}
    if not allowed:
        return func.HttpResponse("No updatable fields", status_code=400)
    allowed["updatedAt"] = datetime.utcnow()

    # ---- DB -----------------------------------------------------------------
    try:
        col = get_db_collections()["FutureGardens"]

        # DEBUG: log token user vs. doc owner
        doc = col.find_one({"_id": gid})
        logging.info(f"PATCH id={gid}, tokenUser={user_oid}, docExists={bool(doc)}, docUser={doc.get('userId') if doc else None}")

        if not doc:
            return func.HttpResponse("Not found", status_code=404)
        if doc.get("userId") != user_oid:
            # clearer than 404 when ownership fails
            return func.HttpResponse("Forbidden: not the owner", status_code=403)

        res = col.update_one({"_id": gid}, {"$set": allowed})
        if res.matched_count == 0:
            return func.HttpResponse("Not found", status_code=404)

        return func.HttpResponse(status_code=204)
    except Exception as e:
        logging.error(f"Error updating garden: {e}")
        return func.HttpResponse("Internal server error", status_code=500)
