import azure.functions as func
import datetime
from bson import ObjectId
from shared.utils import get_db_collections, get_user_id_from_token
import logging
import json

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('💧Processing checkLastWatering request.')
    # Validate and extract user ID from JWT token
    auth_header = req.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return func.HttpResponse("Missing or invalid Authorization header", status_code=401)
    token = auth_header.split(" ", 1)[1]
    try:
        user_id = get_user_id_from_token(token)
    except Exception as e:
        logging.error(f"Token validation failed: {e}")
        return func.HttpResponse("Invalid token", status_code=401)

    collections = get_db_collections()
    sensorreadings_collection = collections["SensorReading"]
    plantsdata_collection = collections["PlantsData"]
    user_plants_collection = collections["UserPlants"]

    today = datetime.date.today()
    notifications = []

    # Find all sensors for this user
    logging.info(f"🔍 Checking plants for user ID: {user_id}")
    user_obj_id = ObjectId(user_id)
    user_plants_record = user_plants_collection.find_one({"userID": user_obj_id})
    if not user_plants_record or "plants" not in user_plants_record:
        return func.HttpResponse(json.dumps([]), mimetype="application/json")

    # For each plant, check if it needs watering
    for plant in user_plants_record["plants"]:
        sensor_id = str(plant.get("sensorID"))
        plant_type = plant.get("plant_type")
        nickname = plant.get("nickname", "Unnamed Plant")
        if not plant_type or not sensor_id:
            continue
        # Find the latest sensor reading for this sensor
        record = sensorreadings_collection.find_one({"sensorID": sensor_id})
        if not record:
            continue
        last_watering = record.get("lastWateringDate")
        if not last_watering:
            continue
        try:
            watering_date = datetime.date.fromisoformat(last_watering)
        except Exception:
            continue
        days_since = (today - watering_date).days
        plant_data = plantsdata_collection.find_one({"plantName": plant_type.lower()})
        if not plant_data:
            continue
        watering_frequency = plant_data.get("wateringFrequency")
        if watering_frequency is None:
            continue
        if days_since > watering_frequency:
            notifications.append(f"🌿 {nickname} needs watering! Last watered {days_since} days ago.")
    logging.info(f"🔔 Notifications generated: {len(notifications)}")       
    return func.HttpResponse(json.dumps(notifications), mimetype="application/json")
