from ..shared.utils import get_user_id_from_token, get_db_collections
import azure.functions as func
import logging
import json

collections = get_db_collections()
user_plants_collection = collections["UserPlants"]

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("getUserPlants function triggered")

    # 🔐 Extract and verify token
    auth_header = req.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return func.HttpResponse("Missing or invalid Authorization header.", status_code=401)

    token = auth_header.split(" ")[1]
    try:
        user_id = get_user_id_from_token(token)
    except Exception as e:
        return func.HttpResponse(str(e), status_code=401)

    # 🔍 Fetch user’s plant data
    user_entry = user_plants_collection.find_one({"userID": user_id})
    if not user_entry or "plants" not in user_entry:
        return func.HttpResponse(
            json.dumps({"plants": []}),
            status_code=200,
            mimetype="application/json"
        )

    return func.HttpResponse(
        json.dumps({"plants": user_entry["plants"]}),
        status_code=200,
        mimetype="application/json"
    )
