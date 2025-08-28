import logging
import azure.functions as func
import json
from datetime import datetime
from bson import ObjectId
from ..shared.utils import get_user_id_from_token, get_db_collections

def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        # Get and validate token
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

        # Parse request body
        try:
            req_body = req.get_json()
            if not req_body:
                return func.HttpResponse(
                    json.dumps({'error': 'Request body is required'}),
                    status_code=400,
                    mimetype='application/json'
                )
        except ValueError:
            return func.HttpResponse(
                json.dumps({'error': 'Invalid JSON in request body'}),
                status_code=400,
                mimetype='application/json'
            )

        # Extract and validate required fields
        latitude = req_body.get('latitude')
        longitude = req_body.get('longitude')
        hazard_type = req_body.get('type')
        description = req_body.get('description', '').strip()

        # Validate required fields
        if latitude is None or longitude is None:
            return func.HttpResponse(
                json.dumps({'error': 'Latitude and longitude are required'}),
                status_code=400,
                mimetype='application/json'
            )

        if not hazard_type:
            return func.HttpResponse(
                json.dumps({'error': 'Hazard type is required'}),
                status_code=400,
                mimetype='application/json'
            )

        if not description:
            return func.HttpResponse(
                json.dumps({'error': 'Description is required'}),
                status_code=400,
                mimetype='application/json'
            )

        # Validate coordinate ranges
        try:
            latitude = float(latitude)
            longitude = float(longitude)
        except (ValueError, TypeError):
            return func.HttpResponse(
                json.dumps({'error': 'Latitude and longitude must be valid numbers'}),
                status_code=400,
                mimetype='application/json'
            )

        if not (-90 <= latitude <= 90):
            return func.HttpResponse(
                json.dumps({'error': 'Latitude must be between -90 and 90'}),
                status_code=400,
                mimetype='application/json'
            )

        if not (-180 <= longitude <= 180):
            return func.HttpResponse(
                json.dumps({'error': 'Longitude must be between -180 and 180'}),
                status_code=400,
                mimetype='application/json'
            )

        # Validate hazard type (ensure it's one of the allowed types)
        valid_hazard_types = [
            # Weather-related
            'frost', 'heatwave', 'flooding', 'wind', 'hail',
            # Plant & Pest
            'aphids', 'whiteflies', 'blight', 'mildew', 'weeds',
            # Environmental
            'pesticide', 'water', 'pollution', 'contamination',
            # Community
            'neighboring', 'other'
        ]

        if hazard_type not in valid_hazard_types:
            return func.HttpResponse(
                json.dumps({'error': f'Invalid hazard type. Must be one of: {", ".join(valid_hazard_types)}'}),
                status_code=400,
                mimetype='application/json'
            )

        # Validate description length
        if len(description) > 1000:  # Limit description to 1000 characters
            return func.HttpResponse(
                json.dumps({'error': 'Description must be 1000 characters or less'}),
                status_code=400,
                mimetype='application/json'
            )

        # Get database connection
        collections = get_db_collections()
        hazards_collection = collections.get('Hazards')
        
        if hazards_collection is None:
            return func.HttpResponse(
                json.dumps({'error': 'Hazards collection not found'}),
                status_code=500,
                mimetype='application/json'
            )

        # Create hazard document
        hazard_document = {
            'type': hazard_type,
            'description': description,
            'latitude': latitude,
            'longitude': longitude,
            'reported_by': user_id,
            'created_at': datetime.utcnow().isoformat(),
            'status': 'active',  # Can be 'active', 'resolved', 'expired'
            'severity': req_body.get('severity', 'medium'),  # low, medium, high
            'verified': False,  # Can be verified by moderators later
            'reports_count': 1,  # Number of users who reported this hazard
            'last_updated': datetime.utcnow().isoformat()
        }

        # Insert hazard into database
        try:
            result = hazards_collection.insert_one(hazard_document)
            hazard_id = str(result.inserted_id)
            
            logging.info(f"Hazard created successfully: {hazard_id} by user {user_id}")

            # Return success response with created hazard data
            response_data = {
                'id': hazard_id,
                'type': hazard_type,
                'description': description,
                'latitude': latitude,
                'longitude': longitude,
                'reported_by': user_id,
                'created_at': hazard_document['created_at'],
                'status': hazard_document['status'],
                'message': 'Hazard created successfully'
            }

            return func.HttpResponse(
                json.dumps(response_data),
                status_code=201,
                mimetype='application/json'
            )

        except Exception as db_error:
            logging.error(f"Database error creating hazard: {db_error}")
            return func.HttpResponse(
                json.dumps({'error': 'Failed to create hazard in database'}),
                status_code=500,
                mimetype='application/json'
            )

    except Exception as e:
        logging.error(f"createHazard error: {e}")
        return func.HttpResponse(
            json.dumps({'error': str(e)}),
            status_code=500,
            mimetype='application/json'
        )
