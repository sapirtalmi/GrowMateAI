from ..shared.utils import get_db_collections
import logging
import azure.functions as func
import json

collections = get_db_collections()
sensor_collection = collections["SensorReading"]
status_collection = collections["DeviceStatus"]

def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        data = req.get_json()
        logging.info(f"Received sensor data: {data}")

        sensor_id = data.get("sensorID")
        if not sensor_id:
            return func.HttpResponse("Missing sensorID in data", status_code=400)

        # Add reading to historical data array
        sensor_collection.update_one(
            { "sensorID": sensor_id },
            {
                "$push": {
                    "data": {
                        "timestamp": data.get("timestamp"),
                        "moisture": data.get("moisture"),
                        "temperature": data.get("temperature"),
                        "humidity": data.get("humidity")
                    }
                }
            },
            upsert=True
        )
        logging.info("Appended reading to SensorReading")

        # Update latest device status
        status_collection.update_one(
            { "deviceId": data["deviceId"] },
            { "$set": data },
            upsert=True
        )
        logging.info("Updated DeviceStatus")

        return func.HttpResponse("Data ingested and stored", status_code=200)

    except Exception as e:
        logging.error(f"Error: {e}")
        return func.HttpResponse(f"Error: {str(e)}", status_code=500)
