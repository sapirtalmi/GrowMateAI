import azure.functions as func
import logging
from pymongo import MongoClient
import os
from datetime import datetime


from urllib.parse import quote_plus
import os


# NEEDED ONLY LOCALLY
# ============================================
# ============================================
# Encode username and password
username = quote_plus('iotAdmin')
password = quote_plus('test@123@123')  # Ensure this is correctly encoded
host = 'smartgardening.global.mongocluster.cosmos.azure.com'

# Correct connection string format
connection_string = f"mongodb+srv://{username}:{password}@{host}/?tls=true&tlsAllowInvalidCertificates=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000"

# Set the connection string in the environment variable
os.environ['COSMOS_CONNECTION_STRING'] = connection_string

# ============================================
# ============================================
COSMOS_CONNECTION_STRING = os.environ['COSMOS_CONNECTION_STRING']

# Connect to MongoDB
client = MongoClient(COSMOS_CONNECTION_STRING)
logging.info("Connected to MongoDB")
db = client['SmartGardenDB']
collection = db['SensorReading']

app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)

@app.route(route="SignalProcessing", methods=["POST"])
def SignalProcessing(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')

    try:
        # Parse JSON data from the request body
        req_body = req.get_json()
        sensor_id = req_body.get('sensorID')
        current_data = {
            "Humidity": req_body.get('Humidity'),
            "Temperature": req_body.get('Temperature'),
            "SoilMoisture": req_body.get('SoilMoisture'),
            "Date": datetime.utcnow().isoformat()  # Add the current date in ISO 8601 format
        }

        # Search for an existing document with the current sensorID
        existing_entry = collection.find_one({"sensorID": sensor_id})

        if existing_entry:
            # Append the new data to the existing entry
            collection.update_one(
                {"sensorID": sensor_id},
                {"$push": {"data": current_data}}
            )
            logging.info(f"Updated existing entry for sensorID: {sensor_id}")
        else:
            # Create a new entry
            new_entry = {
                "sensorID": sensor_id,
                "data": [current_data]
            }
            collection.insert_one(new_entry)
            logging.info(f"Created new entry for sensorID: {sensor_id}")

        return func.HttpResponse(
            "Data processed successfully.",
            status_code=200
        )
    except ValueError:
        return func.HttpResponse(
            "Invalid JSON data.",
            status_code=400
        )
    except Exception as e:
        logging.error(f"An error occurred: {str(e)}")
        return func.HttpResponse(
            "An error occurred while processing the data.",
            status_code=500
        )
@app.route(route="http_trigger", auth_level=func.AuthLevel.ANONYMOUS)
def http_trigger(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')

    name = req.params.get('name')
    if not name:
        try:
            req_body = req.get_json()
        except ValueError:
            pass
        else:
            name = req_body.get('name')

    if name:
        return func.HttpResponse(f"Hello, {name}. This HTTP triggered function executed successfully.")
    else:
        return func.HttpResponse(
             "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.",
             status_code=200
        )

@app.route(route="http_triggerv2", auth_level=func.AuthLevel.ANONYMOUS)
def http_triggerv2(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Python HTTP trigger function processed a request.')

    name = req.params.get('name')
    if not name:
        try:
            req_body = req.get_json()
        except ValueError:
            pass
        else:
            name = req_body.get('name')

    if name:
        return func.HttpResponse(f"Hello, {name}. This HTTP triggered function executed successfully.")
    else:
        return func.HttpResponse(
             "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.",
             status_code=200
        )