from ..shared.utils import get_db_collections
import logging
import azure.functions as func
import json
import os
from pymongo import MongoClient

collections = get_db_collections()
history_collection = collections["SensorReadings"]
status_collection = collections["DeviceStatus"]

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
