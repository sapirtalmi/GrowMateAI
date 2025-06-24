import logging
import azure.functions as func
import json
from ..shared.utils import get_user_id_from_token, get_db_collections

def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        token = req.headers.get('Authorization')
        if not token or not token.startswith('Bearer '):
            return func.HttpResponse(
                json.dumps({'error': 'Missing or invalid Authorization header'}),
                status_code=401,
                mimetype='application/json'
            )
        token = token.split(' ', 1)[1]
        user_id = get_user_id_from_token(token)
        if not user_id:
            return func.HttpResponse(
                json.dumps({'error': 'Invalid token'}),
                status_code=401,
                mimetype='application/json'
            )
        collections = get_db_collections()
        sensor_stock = collections['SensorStock']
        # Find all sensors where currUserID matches user_id
        sensors = sensor_stock.find({'currUserID': user_id})
        sensor_ids = [str(sensor['SensorID']) for sensor in sensors if 'SensorID' in sensor]
        return func.HttpResponse(
            json.dumps({'sensorIDs': sensor_ids}),
            status_code=200,
            mimetype='application/json'
        )
    except Exception as e:
        logging.error(f"getMySensors error: {e}")
        return func.HttpResponse(
            json.dumps({'error': str(e)}),
            status_code=500,
            mimetype='application/json'
        )
