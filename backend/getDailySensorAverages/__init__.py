from ..shared.utils import get_db_collections, get_user_id_from_token
import azure.functions as func
import logging
import json
from bson import ObjectId
from datetime import datetime
from collections import defaultdict
import statistics

collections = get_db_collections()
sensor_collection = collections["SensorReading"]
user_plants_collection = collections["UserPlants"]

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("getDailyAveragesByPlant triggered")

    auth_header = req.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return func.HttpResponse("Missing or invalid Authorization header", status_code=401)

    token = auth_header.split(" ")[1]
    try:
        user_id = get_user_id_from_token(token)
        user_object_id = ObjectId(user_id)
    except Exception as e:
        return func.HttpResponse(str(e), status_code=401)

    try:
        req_body = req.get_json()
        plant_name = req_body.get("plantName")
        if not plant_name:
            return func.HttpResponse("Missing 'plantName' in request body", status_code=400)

        user_entry = user_plants_collection.find_one({"userID": user_object_id})
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

        daily_data = defaultdict(lambda: {"moisture": [], "temperature": [], "humidity": []})
        for entry in data:
            timestamp = entry.get("timestamp")
            if not timestamp:
                continue
            try:
                date = datetime.fromisoformat(timestamp).date()
                daily_data[date]["moisture"].append(entry.get("moisture", 0))
                daily_data[date]["temperature"].append(entry.get("temperature", 0))
                daily_data[date]["humidity"].append(entry.get("humidity", 0))
            except Exception as e:
                logging.warning(f"Invalid timestamp format: {timestamp}")

        daily_averages = {
            str(day): {
                "avg_moisture": statistics.mean(values["moisture"]) if values["moisture"] else None,
                "avg_temperature": statistics.mean(values["temperature"]) if values["temperature"] else None,
                "avg_humidity": statistics.mean(values["humidity"]) if values["humidity"] else None,
            }
            for day, values in daily_data.items()
        }

        return func.HttpResponse(
            json.dumps({
                "sensorID": sensor_id,
                "dailyAverages": daily_averages
            }),
            status_code=200,
            mimetype="application/json"
        )

    except Exception as e:
        logging.error(f"Error in getDailyAveragesByPlant: {str(e)}")
        return func.HttpResponse("Internal server error", status_code=500)
