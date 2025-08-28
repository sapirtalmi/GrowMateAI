import azure.functions as func
import logging
import json
import os
import openai
from datetime import datetime, timedelta
from collections import defaultdict
import statistics
from ..shared.utils import get_user_id_from_token, get_db_collections

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("plantDiagnosis function triggered")

    # 🔐 Validate JWT Token
    auth_header = req.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return func.HttpResponse("Missing or invalid Authorization header", status_code=401)

    token = auth_header.split(" ")[1]
    try:
        user_id = get_user_id_from_token(token)
    except Exception as e:
        logging.error(f"Token validation failed: {str(e)}")
        return func.HttpResponse("Invalid or expired token", status_code=401)

    try:
        req_body = req.get_json()
        plant_type = req_body.get("plantType")
        complaint = req_body.get("complaint")
        image_base64 = req_body.get("imageBase64")
        sensor_id = req_body.get("sensorID")  # New optional field

        if not plant_type or not complaint or not image_base64:
            return func.HttpResponse("Missing one or more fields: plantType, complaint, imageBase64", status_code=400)

        # Get sensor data if sensorID is provided
        sensor_data_text = ""
        if sensor_id:
            logging.info(f"Getting sensor data for sensorID: {sensor_id}")
            humidity_data, temperature_data, soil_moisture_data = get_sensor_data_for_diagnosis(sensor_id)
            
            if humidity_data and temperature_data and soil_moisture_data:
                sensor_data_text = (
                    f"\n\nAdditional Context - Sensor Data (Last 30 Days):\n"
                    f"This plant has been monitored with sensors. Here are the readings from oldest to newest:\n"
                    f"Humidity levels (%): {humidity_data}\n"
                    f"Temperature levels (°C): {temperature_data}\n"
                    f"Soil Moisture levels (1-4 scale, where 1=dry, 2=slightly moist, 3=moist, 4=wet): {soil_moisture_data}\n"
                    f"Please consider these environmental conditions in your diagnosis alongside the visual symptoms.\n"
                    f"Look for patterns that might indicate issues like overwatering, underwatering, temperature stress, or humidity problems."
                )
            else:
                logging.info("No sensor data available for the provided sensorID")

        # 🧠 Build ChatGPT input
        message = {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": (
                        f"You are a bot that helps detect problems in plants based on user complaints and photos.\n"
                        f"Here is the situation:\n"
                        f"Plant type: {plant_type}\n"
                        f"User complaint: {complaint}\n"
                        f"{sensor_data_text}"
                        f"\nPlease analyze the image and determine if there is a visible problem with the plant.\n"
                        f"If a problem is detected, provide a short explanation and specific suggestions to fix it.\n\n"
                        f"Return your response as a JSON object with the following fields:\n"
                        f"- problem: (string) short description of the detected issue, or 'none' if healthy\n"
                        f"- severity: (string) one of: 'low', 'moderate', 'high', or 'none'\n"
                        f"- suggestions: (list of strings) actionable care tips, or an empty list if the plant is healthy\n"
                        f"Important: If no issue is detected, return: {{\"problem\": \"none\", \"severity\": \"none\", \"suggestions\": []}}\n"
                        f"Only return the JSON object. Do not include explanation or markdown."
                    )   
                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{image_base64}"
                    }
                }
            ]
        }
        client = openai.OpenAI(api_key=os.environ["OPENAI_API_KEY"])

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[message],
            max_tokens=1000
        )

        content = response.choices[0].message.content.strip()
        # Remove Markdown formatting if present
        if content.startswith("```json"):
            content = content.replace("```json", "").strip()
        if content.endswith("```"):
            content = content[:-3].strip()

        parsed = json.loads(content)

        print(parsed)

        return func.HttpResponse(
            json.dumps(parsed),
            status_code=200,
            mimetype="application/json"
        )

    except Exception as e:
        print(e)
        logging.error(f"Error in plantDiagnosis: {str(e)}")
        return func.HttpResponse("Internal server error", status_code=500)

def get_sensor_data_for_diagnosis(sensor_id, days_back=30):
    """
    Get sensor readings for the last N days for diagnosis purposes
    Returns formatted strings for humidity, temperature, and soil moisture
    """
    try:
        collections = get_db_collections()
        sensor_collection = collections["SensorReading"]
        
        # Find the sensor record
        record = sensor_collection.find_one({"sensorID": sensor_id})
        if not record or "dailyAverages" not in record:
            return None, None, None
        
        daily_averages = record["dailyAverages"]
        
        # dailyAverages is an array of objects, take the last 30 (or less)
        recent_averages = daily_averages[-days_back:] if len(daily_averages) > days_back else daily_averages
        
        humidity_values = []
        temperature_values = []
        soil_moisture_values = []
        
        for day_data in recent_averages:
            # Extract values, using reasonable defaults if missing
            humidity = day_data.get("Humidity", day_data.get("humidity"))
            temperature = day_data.get("Temperature", day_data.get("temperature"))
            soil_moisture = day_data.get("SoilMoisture", day_data.get("soilMoisture", day_data.get("moisture")))
            
            if humidity is not None:
                humidity_values.append(f"{humidity:.1f}")
            if temperature is not None:
                temperature_values.append(f"{temperature:.1f}")
            if soil_moisture is not None:
                soil_moisture_values.append(f"{soil_moisture:.1f}")
        
        # Create comma-separated strings
        humidity_str = ", ".join(humidity_values) if humidity_values else "No data"
        temperature_str = ", ".join(temperature_values) if temperature_values else "No data"
        soil_moisture_str = ", ".join(soil_moisture_values) if soil_moisture_values else "No data"
        
        return humidity_str, temperature_str, soil_moisture_str
        
    except Exception as e:
        logging.error(f"Error getting sensor data: {str(e)}")
        return None, None, None