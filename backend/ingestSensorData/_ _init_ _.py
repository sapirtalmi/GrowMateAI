from ..shared.utils import get_db_collections
import logging
import azure.functions as func
from datetime import datetime, timedelta
from bson.son import SON
import os

collections = get_db_collections()
sensor_collection = collections["SensorReading"]

def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        data = req.get_json()
        logging.info(f"Received sensor data: {data}")

        sensor_id = data.get("sensorID")
        if not sensor_id:
            return func.HttpResponse("Missing sensorID in data", status_code=400)

        # Use environment variable to offset the date
        day_offset = int(os.getenv("SENSOR_DATE_OFFSET", "0"))
        now = datetime.utcnow()
        date_str = (now.date() + timedelta(days=day_offset)).isoformat()

        # Fetch the last soil moisture value for this sensor (if any)
        last_doc = sensor_collection.find_one({"sensorID": sensor_id}, {"data": {"$slice": -1}})
        last_soil_moisture = None
        if last_doc and "data" in last_doc and last_doc["data"]:
            last_soil_moisture = last_doc["data"][0].get("SoilMoisture")
        current_soil_moisture = data["moisture"]

        # Determine if watering occurred
        watering_detected = False
        if last_soil_moisture is not None and last_soil_moisture < current_soil_moisture:
            # Watering detected, update lastWateringDate
            sensor_collection.update_one(
                {"sensorID": sensor_id},
                {"$set": {"lastWateringDate": date_str}}
            )
            watering_detected = True
            print(f"Watering detected for sensor {sensor_id} on {date_str}")

        # Push the reading into the array for this sensorID
        sensor_collection.update_one(
            { "sensorID": sensor_id },
            {
                "$push": {
                    "data": {
                        "Humidity": data["humidity"],
                        "Temperature": data["temperature"],
                        "SoilMoisture": data["moisture"],
                        "Date": date_str
                    }
                }
            },
            upsert=True
        )

        logging.info("Appended reading to SensorReading.data array")

        # Optional: compute and store daily average as an array
        pipeline = [
            { "$match": { "sensorID": sensor_id } },
            { "$unwind": "$data" },
            { "$match": { "data.Date": date_str } },
            { "$group": {
                "_id": "$data.Date",
                "avgHumidity": { "$avg": "$data.Humidity" },
                "avgTemperature": { "$avg": "$data.Temperature" },
                "avgSoilMoisture": { "$avg": "$data.SoilMoisture" }
            }}
        ]
        avg_result = list(sensor_collection.aggregate(pipeline))
        if avg_result:
            daily_avg = avg_result[0]
            # Remove any existing entry for this date
            sensor_collection.update_one(
                { "sensorID": sensor_id },
                { "$pull": { "dailyAverages": { "Date": date_str } } }
            )
            # Add the new average for this date
            sensor_collection.update_one(
                { "sensorID": sensor_id },
                { "$push": { "dailyAverages": {
                    "Date": date_str,
                    "Humidity": round(daily_avg["avgHumidity"], 1),
                    "Temperature": round(daily_avg["avgTemperature"], 1),
                    "SoilMoisture": round(daily_avg["avgSoilMoisture"], 1)
                }}}
            )
            logging.info("Updated daily averages as array")

        return func.HttpResponse("Reading added and daily average updated", status_code=200)

    except Exception as e:
        logging.error(f"Error: {e}")
        return func.HttpResponse(f"Error: {str(e)}", status_code=500)
