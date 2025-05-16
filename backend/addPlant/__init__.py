from ..shared.utils import get_user_id_from_token, get_db_collections
from bson import ObjectId
import azure.functions as func
import logging
import json


collections = get_db_collections()
user_plants_collection = collections["UserPlants"]


def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Processing AddPlant request.')

    auth_header = req.headers.get('Authorization')
    if not auth_header or not auth_header.startswith("Bearer "):
        return func.HttpResponse("Missing or invalid Authorization header.", status_code=401)

    token = auth_header.split(" ")[1]
    try:
        user_id = ObjectId(get_user_id_from_token(token))  
    except Exception as e:
        return func.HttpResponse(str(e), status_code=401)

    try:
        req_body = req.get_json()
        name = req_body["name"]
        plant_type = req_body["plantType"]
        sensor_id = req_body["deviceID"]
    except Exception as e:
        return func.HttpResponse(f"Invalid input: {str(e)}", status_code=400)

    plant = {
        "name": name,
        "plant_type": plant_type,
        "sensorID": sensor_id
    }

    user_plants_collection.update_one(
        {"userID": user_id},
        {"$push": {"plants": plant}},
        upsert=True
    )

    return func.HttpResponse(f"Plant added successfully for user {user_id}.", status_code=200)
