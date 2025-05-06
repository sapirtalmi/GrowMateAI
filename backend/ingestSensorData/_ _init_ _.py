import logging
import azure.functions as func
import json
import os
from pymongo import MongoClient

# Get the Cosmos DB connection string from environment
COSMOS_URI = os.environ["COSMOS_CONNECTION_STRING"]
client = MongoClient(COSMOS_URI)
db = client["SmartGardenDB"]
collection = db["SensorReadings"]
logging.info("Connected to Cosmos DB.")

def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        data = req.get_json()
        logging.info(f"Received sensor data: {data}")
        result = collection.insert_one(data)
        logging.info(f"Inserted with id: {result.inserted_id}")
        return func.HttpResponse("Data stored successfully", status_code=200)
    except Exception as e:
        logging.error(f"Error: {e}")
        return func.HttpResponse(f"Error: {str(e)}", status_code=500)
