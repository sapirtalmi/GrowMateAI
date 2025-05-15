import azure.functions as func
from azure.functions import HttpRequest, HttpResponse, AuthLevel

import logging
from pymongo import MongoClient
import os
from datetime import datetime,timedelta
import jwt
import bcrypt
import json


app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)


# =============================================
# Helper functions
# =============================================
def get_user_id_from_token(token: str) -> str:
    try:
        secret = os.environ.get("JWT_SECRET_KEY")
        payload = jwt.decode(token, secret, algorithms=["HS256"])
        return payload.get("user_id")
    except Exception as e:
        raise ValueError(f"Invalid token: {str(e)}")
    except jwt.ExpiredSignatureError:
        raise ValueError("Token has expired")


def generate_jwt(payload: dict) -> str:
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')
    if not JWT_SECRET_KEY:
        raise ValueError("JWT_SECRET_KEY not set")
    
    payload["exp"] = datetime.utcnow() + timedelta(hours=1)  # Token expires in 1 hour
    token = jwt.encode(payload, JWT_SECRET_KEY, algorithm="HS256")
    return token
# =============================================
# =============================================



# Connect to MongoDB (wrap safely in try)
try:
    COSMOS_CONNECTION_STRING = os.environ.get('COSMOS_CONNECTION_STRING')
    if not COSMOS_CONNECTION_STRING:
        raise ValueError("COSMOS_CONNECTION_STRING not set")
    client = MongoClient(COSMOS_CONNECTION_STRING,tlsAllowInvalidCertificates=True)
    db = client['SmartGardenDB']
    collection = db['SensorReading']
    users_collection = db['users']
    user_plants_collection = db["userPlants"]

except Exception as e:
    logging.error(f"MongoDB connection failed: {e}")
    collection = None


@app.function_name(name="SignalProcessing")
@app.route(route="SignalProcessing", methods=["POST"], auth_level=func.AuthLevel.ANONYMOUS)
def SignalProcessing(req: HttpRequest) -> HttpResponse:
    logging.info('SignalProcessing function triggered.')
    logging.info(f"Request body: {req.get_body()}")
    
    
    print("4")
    if collection is None:
        print("5")
        return HttpResponse("Database unavailable", status_code=500)
    print("6")

    logging.info('trying....')
    try:
        req_body = req.get_json()
        sensor_id = req_body.get('sensorID')
        current_data = {
            "Humidity": req_body.get('Humidity'),
            "Temperature": req_body.get('Temperature'),
            "SoilMoisture": req_body.get('SoilMoisture'),
            "Date": datetime.utcnow().isoformat()
        }

        existing_entry = collection.find_one({"sensorID": sensor_id})

        if existing_entry:
            collection.update_one(
                {"sensorID": sensor_id},
                {"$push": {"data": current_data}}
            )
            logging.info(f"Updated entry for sensorID: {sensor_id}")
        else:
            collection.insert_one({
                "sensorID": sensor_id,
                "data": [current_data]
            })
            logging.info(f"Created new entry for sensorID: {sensor_id}")

        return HttpResponse("Data processed successfully.", status_code=200)

    except ValueError:
        return HttpResponse("Invalid JSON data.", status_code=400)

    except Exception as e:
        logging.error(f"An error occurred: {str(e)}")
        return HttpResponse("An error occurred while processing the data.", status_code=500)
    

@app.function_name(name="Login")
@app.route(route="login", methods=["POST"], auth_level=AuthLevel.ANONYMOUS)
def login(req: HttpRequest) -> HttpResponse:
    try:
        req_body = req.get_json()
        username = req_body.get("username")
        password = req_body.get("password")

        if not username or not password:
            return HttpResponse("Missing username or password", status_code=400)

        user = users_collection.find_one({"username": username})
        if not user:
            return HttpResponse("User not found", status_code=401)

        hashed_pw = user.get("hashed_password").encode("utf-8")
        if not bcrypt.checkpw(password.encode("utf-8"), hashed_pw):
            return HttpResponse("Invalid password", status_code=401)

        payload = {
            "username": username,
            "user_id": str(user["_id"])
        }
        token = generate_jwt(payload)
        logging.info(f"Generated token for user: {username}")

        return HttpResponse(
            json.dumps({"token": token}),
            status_code=200,
            mimetype="application/json"
        )

    except Exception as e:
        logging.error(f"Login error: {e}")
        return HttpResponse("Internal server error", status_code=500)





@app.function_name(name="addPlant")
@app.route(route="addPlant", methods=["POST"], auth_level=AuthLevel.ANONYMOUS)
def addPlant(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Processing AddPlant request.')

    # Extract JWT token from Authorization header
    auth_header = req.headers.get('Authorization')
    if not auth_header or not auth_header.startswith("Bearer "):
        return func.HttpResponse("Missing or invalid Authorization header.", status_code=401)
    
    token = auth_header.split(" ")[1]
    try:
        user_id = get_user_id_from_token(token)
    except ValueError as e:
        return func.HttpResponse(str(e), status_code=401)

    # Parse JSON body
    try:
        req_body = req.get_json()
        name = req_body["name"]
        plant_type = req_body["plantType"]
        sensor_id = req_body["deviceID"]    
    except Exception as e:
        return func.HttpResponse(f"Invalid input: {str(e)}", status_code=400)

    # New plant object
    plant = {
        "name": name,
        "plant_type": plant_type,
        "sensorID": sensor_id
    }

    # Insert or update user entry
    result = user_plants_collection.update_one(
        {"userID": user_id},
        {"$push": {"plants": plant}},
        upsert=True
    )

    return func.HttpResponse(f"Plant added successfully for user {user_id}.", status_code=200)