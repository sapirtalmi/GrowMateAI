from ..shared.utils import get_user_id_from_token, get_db_collections
import azure.functions as func
import logging
import json
from bson import ObjectId

collections = get_db_collections()
users_collection = collections["Users"]

def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        # Get authorization token
        auth_header = req.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return func.HttpResponse("Unauthorized", status_code=401)
        
        token = auth_header.split(' ')[1]
        user_id = get_user_id_from_token(token)
        
        if not user_id:
            return func.HttpResponse("Invalid token", status_code=401)

        # Get request body
        req_body = req.get_json()
        if not req_body:
            return func.HttpResponse("Request body is required", status_code=400)

        # Extract notification settings
        hazard_notifications = req_body.get("hazardEmailNotifications")
        if not hazard_notifications:
            return func.HttpResponse("hazardEmailNotifications field is required", status_code=400)

        # Validate notification settings
        enabled = hazard_notifications.get("enabled")
        distance = hazard_notifications.get("distance")

        if enabled is None:
            return func.HttpResponse("enabled field is required in hazardEmailNotifications", status_code=400)

        if not isinstance(enabled, bool):
            return func.HttpResponse("enabled field must be a boolean", status_code=400)

        if enabled and distance is not None:
            try:
                distance = float(distance)
                if distance <= 0 or distance > 100:
                    return func.HttpResponse("distance must be between 0 and 100 km", status_code=400)
            except (ValueError, TypeError):
                return func.HttpResponse("distance must be a valid number", status_code=400)

        # Update user document
        update_data = {
            "hazardEmailNotifications": {
                "enabled": enabled,
                "distance": distance if distance is not None else 10  # Default to 10km
            }
        }

        result = users_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )

        if result.matched_count == 0:
            return func.HttpResponse("User not found", status_code=404)

        if result.modified_count == 0:
            logging.info(f"No changes made to user {user_id} notification settings")
        else:
            logging.info(f"Updated notification settings for user {user_id}: enabled={enabled}, distance={distance}")

        return func.HttpResponse(
            json.dumps({
                "message": "Notification settings updated successfully",
                "settings": update_data["hazardEmailNotifications"]
            }),
            status_code=200,
            mimetype="application/json"
        )

    except Exception as e:
        logging.error(f"Error updating notification settings: {e}")
        return func.HttpResponse("Internal server error", status_code=500)
