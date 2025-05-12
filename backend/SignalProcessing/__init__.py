import azure.functions as func
import logging
from pymongo import MongoClient
from datetime import datetime
import os

# Use Azure App Setting for Cosmos DB connection
COSMOS_CONNECTION_STRING = os.environ["COSMOS_CONNECTION_STRING"]
client = MongoClient(COSMOS_CONNECTION_STRING)
db = client["SmartGardenDB"]
collection = db["SensorReading"]

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('SignalProcessing function triggered.')

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
            collection.update_one(
                {"sensorID": sensor_id},
                {"$push": {"data": current_data}}
            )
            logging.info(f"Updated existing entry for sensorID: {sensor_id}")
        else:
            new_entry = {
                "sensorID": sensor_id,
                "data": [current_data]
            }
            collection.insert_one(new_entry)
            logging.info(f"Created new entry for sensorID: {sensor_id}")

        return func.HttpResponse("Data processed successfully.", status_code=200)

    except ValueError:
        return func.HttpResponse("Invalid JSON data.", status_code=400)
    except Exception as e:
        logging.error(f"An error occurred: {str(e)}")
        return func.HttpResponse("An error occurred while processing the data.", status_code=500)
