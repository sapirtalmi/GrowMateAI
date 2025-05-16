import logging
import azure.functions as func
import json
import os
from pymongo import MongoClient

# MongoDB connection setup
COSMOS_URI = os.environ["COSMOS_CONNECTION_STRING"]
client = MongoClient(COSMOS_URI)
db = client["SmartGardenDB"]
history_collection = db["SensorReadings"]       # stores all data points
status_collection = db["DeviceStatus"]          # stores latest only

def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        data = req.get_json()
        logging.info(f"Received sensor data: {data}")

        # Insert into history
        history_collection.insert_one(data)
        logging.info("Inserted into SensorReadings")

        # Update latest status
        status_collection.update_one(
            { "deviceId": data["deviceId"] },  # match by device
            { "$set": data },                  # update with latest reading
            upsert=True                        # create if not exists
        )
        logging.info("Updated DeviceStatus")

        return func.HttpResponse("Data stored and status updated", status_code=200)

    except Exception as e:
        logging.error(f"Error: {e}")
        return func.HttpResponse(f"Error: {str(e)}", status_code=500)
