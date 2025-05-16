from ..getSensorHistory import collection
from ..shared.utils import get_db_collections
import azure.functions as func
import logging
import json
from datetime import datetime

collections = get_db_collections()
users_collection = collections["users"]

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("SignalProcessing function triggered.")
    if collection is None:
        return func.HttpResponse("Database unavailable", status_code=500)

    try:
        req_body = req.get_json()
        sensor_id = req_body.get('sensorID')
        current_data = {
            "Humidity": req_body.get('Humidity'),
            "Temperature": req_body.get('Temperature'),
            "SoilMoisture": req_body.get('SoilMoisture'),
            "Date": datetime.utcnow().isoformat()
        }

        existing_entry = collection.find_one({"sensorID": sensor_id})
        if existing_entry:
            collection.update_one({"sensorID": sensor_id}, {"$push": {"data": current_data}})
        else:
            collection.insert_one({"sensorID": sensor_id, "data": [current_data]})

        return func.HttpResponse("Data processed successfully.", status_code=200)

    except Exception as e:
        logging.error(f"Error in SignalProcessing: {str(e)}")
        return func.HttpResponse("Processing error", status_code=500)
