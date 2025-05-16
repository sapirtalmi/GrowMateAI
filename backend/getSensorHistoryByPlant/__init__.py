import azure.functions as func
import logging
import json
from ..shared.utils import get_db_collections, get_user_id_from_token

collections = get_db_collections()
sensor_collection = collections["sensor_data"]
user_plants_collection = collections["user_plants"]

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("getSensorHistoryByPlant triggered")

    auth_header = req.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return func.HttpResponse("Missing or invalid Authorization header", status_code=401)

    token = auth_header.split(" ")[1]
    try:
        user_id = get_user_id_from_token(token)
    except Exception as e:
        return func.HttpResponse(str(e), status_code=401)

    try:
        req_body = req.get_json()
        plant_name = req_body.get("plantName")
        if not plant_name:
            return func.HttpResponse("Missing 'plantName' in request body", status_code=400)

        user_entry = user_plants_collection.find_one({"userID": user_id})
        if not user_entry:
            return func.HttpResponse("User has no plants", status_code=404)

        matching_plant = next(
            (plant for plant in user_entry["plants"] if plant["name"] == plant_name),
            None
        )

        if not matching_plant:
            return func.HttpResponse("Plant not found", status_code=404)

        sensor_id = matching_plant["sensorID"]
        record = sensor_collection.find_one({"sensorID": sensor_id})
        data = record["data"] if record and "data" in record else []

        return func.HttpResponse(
            json.dumps({"sensorID": sensor_id, "data": data}),
            status_code=200,
            mimetype="application/json"
        )

    except Exception as e:
        logging.error(f"Error in getSensorHistoryByPlant: {str(e)}")
        return func.HttpResponse("Internal server error", status_code=500)
