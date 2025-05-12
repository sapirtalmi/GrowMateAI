import azure.functions as func
import pymongo
import json
import os

COSMOS_URI = os.environ["COSMOS_CONNECTION_STRING"]
client = pymongo.MongoClient(COSMOS_URI)
db = client["SmartGardenDB"]
collection = db["SensorReadings"]

def main(req: func.HttpRequest) -> func.HttpResponse:
    device_id = req.params.get("deviceId")
    if not device_id:
        return func.HttpResponse("Missing deviceId", status_code=400)

    cursor = collection.find({"deviceId": device_id}).sort("_id", -1).limit(10)
    docs = [{**doc, "_id": str(doc["_id"])} for doc in cursor]

    return func.HttpResponse(json.dumps(docs), mimetype="application/json")
