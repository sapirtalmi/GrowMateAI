from ..shared.utils import get_db_collections
import azure.functions as func
import logging
import json
from bson import ObjectId

collections = get_db_collections()
sensor_collection = collections["SensorReading"]

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("getSensorHistoryByDeviceID function triggered")

    sensor_id = req.params.get("sensorID")
    if not sensor_id:
        try:
            req_body = req.get_json()
            sensor_id = req_body.get("sensorID")
        except Exception:
            pass

    if not sensor_id:
        return func.HttpResponse("Missing 'sensorID' in query or body", status_code=400)

    try:
        record = sensor_collection.find_one({"sensorID": sensor_id})
        if not record or "data" not in record:
            return func.HttpResponse(
                json.dumps({"data": []}),
                status_code=200,
                mimetype="application/json"
            )

        return func.HttpResponse(
            json.dumps({"data": record["data"]}),
            status_code=200,
            mimetype="application/json"
        )
    except Exception as e:
        logging.error(f"Error fetching sensor data: {str(e)}")
        return func.HttpResponse("Server error", status_code=500)
