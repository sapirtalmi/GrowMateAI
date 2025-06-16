import os
import logging
import jwt
import bcrypt
from datetime import datetime, timedelta
from pymongo import MongoClient


# === JWT HELPERS ===
def get_user_id_from_token(token: str) -> str:
    try:
        secret = os.environ.get("JWT_SECRET_KEY")
        payload = jwt.decode(token, secret, algorithms=["HS256"])
        return payload.get("user_id")
    except Exception as e:
        raise ValueError(f"Invalid token: {str(e)}")



def generate_jwt(payload: dict) -> str:
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')
    if not JWT_SECRET_KEY:
        raise ValueError("JWT_SECRET_KEY not set")

    payload["exp"] = datetime.utcnow() + timedelta(hours=1)
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm="HS256")


# === MONGODB CONNECTION ===
def get_db_collections():
    try:
        conn_str = os.environ.get("COSMOS_CONNECTION_STRING")
        if not conn_str:
            raise ValueError("COSMOS_CONNECTION_STRING not set")
        client = MongoClient(conn_str, tlsAllowInvalidCertificates=True)
        db = client['SmartGardenDB']
        return {
        "SensorReading": db['SensorReading'],
        "Users": db['Users'],
        "UserPlants": db['UserPlants'],
        "SensorReadings": db['SensorReadings'],       
        "DeviceStatus": db['DeviceStatus'],
        "CommunityPosts": db['CommunityPosts'],
        "CommunityComments": db['CommunityComments'],
        "Votes": db['Votes']

    }
    except Exception as e:
        logging.error(f"MongoDB connection failed: {e}")
        raise
