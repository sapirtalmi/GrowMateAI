import os
import random
from pymongo import MongoClient
from dotenv import load_dotenv
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = "SmartGardenDB"
COLLECTION_NAME = "SensorStock"

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
collection = db[COLLECTION_NAME]

# Clear existing stock for repeatable runs (optional)
collection.delete_many({})

sensors = []
for _ in range(10):
    sensor_id = f"GrowMate{random.randint(100, 999)}"
    pairing_key = str(random.randint(10000, 99999))
    sensors.append({
        "SensorID": sensor_id,
        "PairingKey": pairing_key
    })

collection.insert_many(sensors)
print(f"Inserted {len(sensors)} fake sensor stock records into '{COLLECTION_NAME}' collection.")