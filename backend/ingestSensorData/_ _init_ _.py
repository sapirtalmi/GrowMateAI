from ..shared.utils import get_db_collections
import logging
import azure.functions as func
from datetime import datetime, timedelta
from bson.son import SON
from bson import ObjectId
import os
import json
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

collections = get_db_collections()
sensor_collection = collections["SensorReading"]
users_collection = collections["Users"]

def send_watering_notification_email(user_id, plants_needing_watering):
    """
    Send email notification to user about plants needing watering
    """
    try:
        # Get SendGrid API key from environment
        sendgrid_api_key = os.getenv("SENDGRID_API_KEY")
        if not sendgrid_api_key:
            logging.warning("SENDGRID_API_KEY not found in environment variables")
            return False
        
        # Get user email from database
        user_record = users_collection.find_one({"_id": ObjectId(user_id) if isinstance(user_id, str) else user_id})
        if not user_record or "email" not in user_record:
            logging.warning(f"No email found for user {user_id}")
            return False
        
        user_email = user_record["email"]
        username = user_record.get("username", "Gardener")
        
        # Check if user accepts email notifications
        if not user_record.get("acceptEmailNotifications", False):
            logging.info(f"User {username} has email notifications disabled")
            return False
        
        # Create email content
        plant_list = ""
        for plant in plants_needing_watering:
            plant_list += f"<li><strong>{plant['nickname']}</strong> ({plant['plant_type']}) - Last watered {plant['days_since_watering']} days ago</li>"
        
        html_content = f"""
        <html>
        <body>
            <h2>🌿 Your Plants Need Water! 💧</h2>
            <p>Hello {username},</p>
            <p>Our sensors have detected that some of your plants need watering:</p>
            <ul>
                {plant_list}
            </ul>
            <p>Please check on your plants and water them if needed.</p>
            <br>
            <p>Happy gardening! 🌱</p>
            <p><em>- Your GrowMate AI Team</em></p>
        </body>
        </html>
        """
        
        # Create and send email
        message = Mail(
            from_email='michaeljornist@gmail.com',  # Your sender email
            to_emails=user_email,
            subject=f'🌿 Watering Alert: {len(plants_needing_watering)} plant(s) need water',
            html_content=html_content
        )
        
        sg = SendGridAPIClient(sendgrid_api_key)
        response = sg.send(message)
        
        logging.info(f"Email sent successfully to {user_email}. Status: {response.status_code}")
        return True
        
    except Exception as e:
        logging.error(f"Error sending email notification: {e}")
        return False

def check_plants_needing_watering(sensor_id):
    """
    Check if any plants connected to this sensor need watering
    Returns list of plant nicknames that need watering
    """
    try:
        # Get the flag to control this functionality
        check_watering_enabled = os.getenv("CHECK_WATERING_ON_INGEST", "false").lower() == "true"
        if not check_watering_enabled:
            return []

        logging.info(f"🔍 Checking plants needing watering for sensor: {sensor_id}")
        
        # Get collections
        sensor_stock_collection = collections["SensorStock"]
        user_plants_collection = collections["UserPlants"]
        plants_data_collection = collections["PlantsData"]
        
        # Find the sensor in SensorStock to get the current user
        sensor_record = sensor_stock_collection.find_one({"SensorID": sensor_id})
        if not sensor_record or "currUserID" not in sensor_record:
            logging.info(f"No user paired with sensor {sensor_id}")
            return []
        
        curr_user_id = sensor_record["currUserID"]
        logging.info(f"Found user {curr_user_id} paired with sensor {sensor_id}")
        
        # Convert to ObjectId if it's a string
        if isinstance(curr_user_id, str):
            try:
                user_obj_id = ObjectId(curr_user_id)
            except:
                logging.error(f"Invalid user ID format: {curr_user_id}")
                return []
        else:
            user_obj_id = curr_user_id
        
        # Find all plants for this user
        user_plants_record = user_plants_collection.find_one({"userID": user_obj_id})
        if not user_plants_record or "plants" not in user_plants_record:
            logging.info(f"No plants found for user {curr_user_id}")
            return []
        
        plants_needing_watering = []
        today = datetime.now().date()
        
        # Check each plant connected to this sensor
        for plant in user_plants_record["plants"]:
            plant_sensor_id = str(plant.get("sensorID", ""))
            if plant_sensor_id != str(sensor_id):
                continue  # Skip plants not connected to this sensor
            
            plant_type = plant.get("plant_type")
            nickname = plant.get("nickname", "Unnamed Plant")
            logging.info(f"Checking plant '{nickname}' of type '{plant_type}'")
            
            if not plant_type:
                continue
            
            # Find the sensor reading record
            sensor_reading_record = sensor_collection.find_one({"sensorID": sensor_id})
            if not sensor_reading_record:
                continue
            
            last_watering = sensor_reading_record.get("lastWateringDate")
            if not last_watering:
                continue
            
            try:
                watering_date = datetime.fromisoformat(last_watering).date()
            except Exception as e:
                logging.error(f"Error parsing watering date {last_watering}: {e}")
                continue
            
            days_since = (today - watering_date).days
            
            # Get plant data to check watering frequency
            plant_data = plants_data_collection.find_one({"plantName": plant_type.lower()})
            if not plant_data:
                logging.warning(f"No plant data found for type: {plant_type}")
                continue
            
            watering_frequency = plant_data.get("wateringFrequency")
            if watering_frequency is None:
                continue
            
            if days_since > watering_frequency:
                plants_needing_watering.append({
                    "nickname": nickname,
                    "plant_type": plant_type,
                    "days_since_watering": days_since,
                    "watering_frequency": watering_frequency
                })
                logging.info(f"🌿 Plant {nickname} needs watering! Last watered {days_since} days ago.")
        
        return plants_needing_watering
        
    except Exception as e:
        logging.error(f"Error checking plants needing watering: {e}")
        return []

def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        data = req.get_json()
        logging.info(f"Received sensor data: {data}")

        sensor_id = data.get("sensorID")
        if not sensor_id:
            return func.HttpResponse(
                json.dumps({"error": "Missing sensorID in data"}),
                status_code=400,
                mimetype="application/json"
            )

        # Use environment variable to offset the date
        day_offset = int(os.getenv("SENSOR_DATE_OFFSET", "0"))
        now = datetime.utcnow()
        date_str = (now.date() + timedelta(days=day_offset)).isoformat()

        # Fetch the last soil moisture value for this sensor (if any)
        last_doc = sensor_collection.find_one({"sensorID": sensor_id}, {"data": {"$slice": -1}})
        last_soil_moisture = None
        if last_doc and "data" in last_doc and last_doc["data"]:
            last_soil_moisture = last_doc["data"][0].get("SoilMoisture")
        current_soil_moisture = data["moisture"]

        # Determine if watering occurred
        watering_detected = False
        if last_soil_moisture is not None and last_soil_moisture < current_soil_moisture:
            # Watering detected, update lastWateringDate
            sensor_collection.update_one(
                {"sensorID": sensor_id},
                {"$set": {"lastWateringDate": date_str}}
            )
            watering_detected = True
            print(f"Watering detected for sensor {sensor_id} on {date_str}")

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

        # Optional: compute and store daily average as an array
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
            # Remove any existing entry for this date
            sensor_collection.update_one(
                { "sensorID": sensor_id },
                { "$pull": { "dailyAverages": { "Date": date_str } } }
            )
            # Add the new average for this date
            sensor_collection.update_one(
                { "sensorID": sensor_id },
                { "$push": { "dailyAverages": {
                    "Date": date_str,
                    "Humidity": round(daily_avg["avgHumidity"], 1),
                    "Temperature": round(daily_avg["avgTemperature"], 1),
                    "SoilMoisture": round(daily_avg["avgSoilMoisture"], 1)
                }}}
            )
            logging.info("Updated daily averages as array")

        # Check for plants needing watering (controlled by environment variable)
        plants_needing_watering = check_plants_needing_watering(sensor_id)
        
        # Send email notification if plants need watering
        if plants_needing_watering:
            # Get the user ID for this sensor to send email
            try:
                sensor_stock_collection = collections["SensorStock"]
                sensor_record = sensor_stock_collection.find_one({"SensorID": sensor_id})
                if sensor_record and "currUserID" in sensor_record:
                    user_id = sensor_record["currUserID"]
                    
                    # Check if we've sent an email recently to avoid spam (once per day max)
                    today_str = datetime.utcnow().date().isoformat()
                    last_email_sent = sensor_record.get("lastEmailSent")
                    
                    if last_email_sent != today_str:
                        email_sent = send_watering_notification_email(user_id, plants_needing_watering)
                        if email_sent:
                            # Update the last email sent date to avoid spam
                            sensor_stock_collection.update_one(
                                {"SensorID": sensor_id},
                                {"$set": {"lastEmailSent": today_str}}
                            )
                            logging.info(f"Email notification sent successfully for user {user_id}")
                        else:
                            logging.warning(f"Failed to send email notification for user {user_id}")
                    else:
                        logging.info(f"Email already sent today for sensor {sensor_id}, skipping to avoid spam")
            except Exception as e:
                logging.error(f"Error sending email notification: {e}")
        
        # Prepare response
        response_data = {
            "message": "Reading added and daily average updated",
            "sensorID": sensor_id,
            "watering_detected": watering_detected,
            "plants_needing_watering": [plant["nickname"] for plant in plants_needing_watering] if plants_needing_watering else []
        }
        
        if plants_needing_watering:
            logging.info(f"🚨 Plants needing watering: {[p['nickname'] for p in plants_needing_watering]}")
            response_data["watering_alerts"] = plants_needing_watering
            # Add email status to response for debugging
            try:
                sensor_stock_collection = collections["SensorStock"]
                sensor_record = sensor_stock_collection.find_one({"SensorID": sensor_id})
                today_str = datetime.utcnow().date().isoformat()
                last_email_sent = sensor_record.get("lastEmailSent") if sensor_record else None
                response_data["email_notification_sent"] = last_email_sent == today_str
                response_data["last_email_sent"] = last_email_sent
            except:
                pass
        
        return func.HttpResponse(
            json.dumps(response_data),
            status_code=200,
            mimetype="application/json"
        )

    except Exception as e:
        logging.error(f"Error: {e}")
        return func.HttpResponse(
            json.dumps({"error": str(e)}),
            status_code=500,
            mimetype="application/json"
        )
