from ..shared.utils import get_db_collections
import logging
import azure.functions as func
from datetime import datetime
from bson.son import SON

collections = get_db_collections()
sensor_collection = collections["SensorReading"]

def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        data = req.get_json()
        logging.info(f"Received sensor data: {data}")

        sensor_id = data.get("sensorID")
        if not sensor_id:
            return func.HttpResponse("Missing sensorID in data", status_code=400)

        # Parse and normalize date to date-only string (e.g., "2025-05-16")
        date_obj = datetime.fromisoformat(data["timestamp"].replace("Z", "+00:00"))
        date_str = date_obj.date().isoformat()

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

        # Optional: compute and store daily average
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
            sensor_collection.update_one(
                { "sensorID": sensor_id },
                {
                    "$set": {
                        f"dailyAverages.{date_str}": {
                            "Humidity": round(daily_avg["avgHumidity"], 1),
                            "Temperature": round(daily_avg["avgTemperature"], 1),
                            "SoilMoisture": round(daily_avg["avgSoilMoisture"], 1)
                        }
                    }
                }
            )
            logging.info("Updated daily averages")

        return func.HttpResponse("Reading added and daily average updated", status_code=200)

    except Exception as e:
        logging.error(f"Error: {e}")
        return func.HttpResponse(f"Error: {str(e)}", status_code=500)
