import azure.functions as func
import logging
import json
import uuid
from datetime import datetime
from ..shared.utils import get_user_id_from_token
from ..shared.mongo import get_db_collections

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("convertToUserPlants triggered")

    token = req.headers.get("Authorization", "").replace("Bearer ", "")
    try:
        user_id = get_user_id_from_token(token)
    except Exception:
        return func.HttpResponse("Unauthorized", status_code=401)

    garden_id = req.params.get("id")
    if not garden_id:
        return func.HttpResponse("Missing garden ID", status_code=400)

    try:
        collections = get_db_collections()
        gardens = collections["FutureGardens"]
        user_plants = collections["UserPlants"]

        garden = gardens.find_one({"_id": garden_id})
        if not garden or garden["userId"] != user_id:
            return func.HttpResponse("Not found or forbidden", status_code=404)

        for plant in garden["plan"]["plants"]:
            user_plants.insert_one({
                "_id": str(uuid.uuid4()),
                "userId": user_id,
                "plant": plant,
                "addedAt": datetime.utcnow()
            })

        return func.HttpResponse("Converted to My Plants", status_code=200)

    except Exception as e:
        logging.error(f"Convert error: {e}")
        return func.HttpResponse("Internal server error", status_code=500)
