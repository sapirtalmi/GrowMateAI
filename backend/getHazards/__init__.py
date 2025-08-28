import logging
import azure.functions as func
import json
import math
from ..shared.utils import get_user_id_from_token, get_db_collections

def calculate_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the great circle distance between two points 
    on the earth (specified in decimal degrees)
    Returns distance in kilometers
    """
    # Convert decimal degrees to radians
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])

    # Haversine formula
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    
    # Radius of earth in kilometers
    r = 6371
    return c * r

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

        # Get parameters from request body
        try:
            user_lat = float(req_body.get('latitude', 0))
            user_lon = float(req_body.get('longitude', 0))
            radius_km = float(req_body.get('radius_km', 10))  # Default 10km radius
        except (ValueError, TypeError):
            return func.HttpResponse(
                json.dumps({'error': 'Invalid coordinates or radius. Please provide valid latitude, longitude, and radius_km parameters.'}),
                status_code=400,
                mimetype='application/json'
            )

        # Validate coordinates
        if not (-90 <= user_lat <= 90) or not (-180 <= user_lon <= 180):
            return func.HttpResponse(
                json.dumps({'error': 'Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180.'}),
                status_code=400,
                mimetype='application/json'
            )

        if radius_km <= 0 or radius_km > 1000:  # Max 1000km radius
            return func.HttpResponse(
                json.dumps({'error': 'Invalid radius. Must be between 0 and 1000 km.'}),
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

        # Retrieve all hazards from database
        all_hazards = list(hazards_collection.find({}))
        
        # Filter hazards within the specified radius
        nearby_hazards = []
        for hazard in all_hazards:
            try:
                hazard_lat = float(hazard.get('latitude', 0))
                hazard_lon = float(hazard.get('longitude', 0))
                
                # Calculate distance between user and hazard
                distance = calculate_distance(user_lat, user_lon, hazard_lat, hazard_lon)
                
                if distance <= radius_km:
                    # Add distance to hazard data for client use
                    hazard_data = {
                        'id': str(hazard.get('_id', '')),
                        'type': hazard.get('type', 'unknown'),
                        'description': hazard.get('description', ''),
                        'latitude': hazard_lat,
                        'longitude': hazard_lon,
                        'created_at': hazard.get('created_at', ''),
                        'reported_by': hazard.get('reported_by', ''),
                        'distance_km': round(distance, 2)
                    }
                    nearby_hazards.append(hazard_data)
            except (ValueError, TypeError, KeyError) as e:
                logging.warning(f"Skipping invalid hazard data: {e}")
                continue

        # Sort by distance (closest first)
        nearby_hazards.sort(key=lambda x: x['distance_km'])

        logging.info(f"Found {len(nearby_hazards)} hazards within {radius_km}km of user location ({user_lat}, {user_lon})")

        return func.HttpResponse(
            json.dumps({
                'hazards': nearby_hazards,
                'user_location': {
                    'latitude': user_lat,
                    'longitude': user_lon
                },
                'radius_km': radius_km,
                'total_found': len(nearby_hazards)
            }),
            status_code=200,
            mimetype='application/json'
        )

    except Exception as e:
        logging.error(f"getHazards error: {e}")
        return func.HttpResponse(
            json.dumps({'error': str(e)}),
            status_code=500,
            mimetype='application/json'
        )
