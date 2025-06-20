import azure.functions as func
import logging
import json
import uuid
from datetime import datetime
from ..shared.utils import get_user_id_from_token, get_db_collections

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("editFutureGarden triggered")

    token = req.headers.get("Authorization", "").replace("Bearer ", "")
    try:
        user_id = get_user_id_from_token(token)
    except Exception:
        return func.HttpResponse("Unauthorized", status_code=401)

    garden_id = req.params.get("id")
    if not garden_id:
        return func.HttpResponse("Missing garden ID", status_code=400)

    try:
        new_plan = req.get_json().get("plan")
        if not new_plan:
            return func.HttpResponse("Missing plan data", status_code=400)

        collections = get_db_collections()
        gardens = collections["FutureGardens"]

        result = gardens.find_one({"_id": garden_id})
        if not result or result["userId"] != user_id:
            return func.HttpResponse("Not found or forbidden", status_code=404)

        gardens.update_one(
            {"_id": garden_id},
            {"$set": {"plan": new_plan, "updatedAt": datetime.utcnow()}}
        )

        return func.HttpResponse("Plan updated", status_code=200)

    except Exception as e:
        logging.error(f"Edit error: {e}")
        return func.HttpResponse("Internal server error", status_code=500)
