import azure.functions as func
import logging
import json
from bson import ObjectId
from ..shared.utils import get_user_id_from_token, get_db_collections

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("deleteFutureGarden function triggered")

    auth_header = req.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return func.HttpResponse("Missing or invalid Authorization header", status_code=401)

    token = auth_header.split(" ")[1]
    try:
        user_id = get_user_id_from_token(token)
    except Exception as e:
        return func.HttpResponse("Unauthorized", status_code=401)

    try:
        req_body = req.get_json()
        garden_id = req_body.get("id")

        if not garden_id:
            return func.HttpResponse("Missing garden ID", status_code=400)

        collections = get_db_collections()
        result = collections["FutureGardens"].delete_one({
            "_id": ObjectId(garden_id),
            "userId": user_id
        })

        if result.deleted_count == 0:
            return func.HttpResponse("Garden not found or unauthorized", status_code=404)

        return func.HttpResponse("Garden deleted", status_code=200)

    except Exception as e:
        logging.error(f"Delete error: {e}")
        return func.HttpResponse("Internal server error", status_code=500)
