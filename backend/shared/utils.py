import os
import logging
import jwt
import bcrypt
from datetime import datetime, timedelta
from pymongo import MongoClient
import openai
import json

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
        "Users": db['Users'],
        "UserPlants": db['UserPlants'],
        "SensorReading": db['SensorReading'],       
        "DeviceStatus": db['DeviceStatus'],
        "CommunityPosts": db['CommunityPosts'],
        "CommunityComments": db['CommunityComments'],
        "SensorStock": db['SensorStock'],
        "PlantsData": db['PlantsData'],
        "Votes": db['Votes']
    }
    except Exception as e:
        logging.error(f"MongoDB connection failed: {e}")
        raise


def checkValidPlantName(plant_type: str) -> str:
    #Check if the plant name is valid using OpenAI's GPT model
    # This function will return 'valid' if the name is valid,
    # a suggestion for the correct name if it's invalid, or 'invalid' if unsure.


    try:
        # 🧠 Build ChatGPT input
        message = {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": (
                        f"U are a bot that helps users identify valid plant names.\n"
                        f"Here is the plant name: {plant_type}\n"
                        f"Please check if this is a valid plant name.\n"
                        f"If it is valid, return 'valid'. If it is not valid, respond ONLY with a suggestion of what the correct name might be. - Just names of plants.\n"
                        f"if u are not sure at all, return 'invalid'.\n"
                        f"Do not include any explanation or extra text.\n"
                    ) 
                }
            ]
        }
        client = openai.OpenAI(api_key=os.environ["OPENAI_API_KEY"])

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[message],
            max_tokens=100
        )

        content = response.choices[0].message.content.strip()
        # Remove Markdown formatting if present
        if content.startswith("```json"):
            content = content.replace("```json", "").strip()
        if content.endswith("```"):
            content = content[:-3].strip()


        return content

    except Exception as e:
        print(e)
        logging.error(f"Error in plant name : {str(e)}")


def addPlantToPlantsData(plant_name: str) -> None:
    # Add plant data to the PlantsData collection using OpenAI's GPT model
    print(f"Adding plant '{plant_name}' to PlantsData...")
    
    collections = get_db_collections()
    plants_data_collection = collections["PlantsData"]

    try:
        # Check if plant already exists (check against 'plantName' field)
        existing_plant = plants_data_collection.find_one({"plantName": plant_name})
        if existing_plant:
            print(f"✅ Plant '{plant_name}' already exists in PlantsData.")
            return

        # 🔥 Prompt preparation
        prompt = f"""
                You are a smart gardening assistant.

                Generate a JSON object with detailed care and environmental requirements for the plant "{plant_name}".

                Fields required (must match exactly):

                - "plantName": Common name of the plant (string)
                - "scientificName": Scientific Latin name (string)
                - "type": Plant type (e.g., Herb, Vegetable, Fruit, Tree, etc.)
                - "category": "Indoor", "Outdoor", or "Both"
                - "minTemperature": Minimum recommended temperature in Celsius (number)
                - "maxTemperature": Maximum recommended temperature in Celsius (number)
                - "sunlightRequirement": One of: "Full sun", "Partial shade", "Low light"
                - "humidityPreference": "Low", "Moderate", or "High"
                - "soilType": Soil type best suited (e.g., Loamy, Sandy, Clay, etc.)
                - "soilPH": Ideal pH range as a string (e.g., "6.0–7.5")
                - "wateringFrequency": number that represents how often to water , foe exmple 3 := every 3 days
                - "wateringAmount": One of: "Low", "Medium", "High"
                - "fertilizerType": Type of fertilizer recommended (string)
                - "fertilizerFrequency": A sentence like "every 2 weeks", etc.
                - "companionPlants": A list of plant names (strings)
                - "pruningTips": A helpful sentence or tip for pruning (string)
                - "growingSeason": A list of two seasons as strings (e.g., ["Spring", "Summer"])
                - "harvestTime": A duration string like "60 days" or "90–100 days"
                - "tips": A list of care tips (strings), as a short and quick information

                Rules:
                - Respond ONLY with a valid JSON object.
                - Do not include any explanation.
                - Format must be parsable by `json.loads(...)` in Python.
                - dont use uppercase letters in plantName , scientificName , type
                """

        messages = [{"role": "user", "content": prompt}]
        client = openai.OpenAI(api_key=os.environ["OPENAI_API_KEY"])

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            max_tokens=1000
        )

        content = response.choices[0].message.content.strip()

        # Clean Markdown fencing if present
        if content.startswith("```json"):
            content = content.replace("```json", "").strip()
        if content.endswith("```"):
            content = content[:-3].strip()

        # 👇 Parse and insert
        try:
            plant_data = json.loads(content)
            plants_data_collection.insert_one(plant_data)
            print(f"✅ Successfully added '{plant_name}' to PlantsData.")
        except json.JSONDecodeError as decode_err:
            print(f"❌ Failed to parse JSON for '{plant_name}': {decode_err}")
            print(f"Raw content: {content}")

    except Exception as e:
        print(f"❌ Error adding plant '{plant_name}': {e}")


