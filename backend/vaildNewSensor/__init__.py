import logging
import azure.functions as func
from ..shared.utils import get_db_collections, get_user_id_from_token

def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        # Validate JWT token from Authorization header using shared.utils
        auth_header = req.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return func.HttpResponse("Missing or invalid Authorization header.", status_code=401)
        token = auth_header.split(" ", 1)[1]
        try:
            user_id = get_user_id_from_token(token)
        except Exception as e:
            logging.error(f"JWT decode error: {e}")
            return func.HttpResponse("Invalid token.", status_code=401)

        data = req.get_json()
        sensor_id = data.get("sensorID") or data.get("SensorID")
        pairing_key = data.get("pairingKey") or data.get("PairingKey")
        req_user_id = data.get("userID") or user_id
        logging.info(f"Validating sensor with ID: {sensor_id}, pairing key: {pairing_key}, user ID: {req_user_id}")
        if not sensor_id or not pairing_key or not req_user_id:
            return func.HttpResponse(
                "Missing sensorID, pairingKey, or userID in request.", status_code=400
            )
        collections = get_db_collections()
        sensor_stock_col = collections.get("SensorStock")
        record = sensor_stock_col.find_one({"SensorID": sensor_id, "PairingKey": pairing_key})
        if record:
            # Update the record with currUserID
            sensor_stock_col.update_one(
                {"_id": record["_id"]},
                {"$set": {"currUserID": req_user_id}}
            )
            return func.HttpResponse("Valid sensor.", status_code=200)
        else:
            return func.HttpResponse("Invalid sensor or pairing key.", status_code=404)
    except Exception as e:
        logging.error(f"Error in vaildNewSensor: {e}")
        return func.HttpResponse(f"Internal server error: {str(e)}", status_code=500)
