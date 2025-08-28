import azure.functions as func
import json
import logging
from shared.utils import get_mongo_client, verify_jwt_token, corsify_response

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Processing get hazard messages request')
    
    # Handle CORS preflight
    if req.method == "OPTIONS":
        return corsify_response(func.HttpResponse(status_code=200))
    
    try:
        # Verify JWT token
        token_result = verify_jwt_token(req)
        if isinstance(token_result, func.HttpResponse):
            return corsify_response(token_result)
        
        # Get hazard ID from route
        hazard_id = req.route_params.get('hazardId')
        if not hazard_id:
            return corsify_response(func.HttpResponse(
                json.dumps({"error": "Hazard ID is required"}),
                status_code=400,
                mimetype="application/json"
            ))
        
        # Get messages from MongoDB
        client = get_mongo_client()
        db = client['gardeningDB']
        collection = db['hazardMessages']
        
        # Query messages for this hazard, sorted by timestamp
        messages_cursor = collection.find(
            {"hazardId": hazard_id}
        ).sort("created_at", 1)  # Oldest first
        
        # Convert to list and prepare for JSON response
        messages = []
        for msg in messages_cursor:
            messages.append({
                "id": msg.get("id"),
                "hazardId": msg.get("hazardId"),
                "userId": msg.get("userId"),
                "username": msg.get("username"),
                "message": msg.get("message"),
                "timestamp": msg.get("timestamp")
            })
        
        return corsify_response(func.HttpResponse(
            json.dumps({
                "success": True,
                "messages": messages
            }),
            status_code=200,
            mimetype="application/json"
        ))
        
    except Exception as e:
        logging.error(f"Error getting hazard messages: {str(e)}")
        return corsify_response(func.HttpResponse(
            json.dumps({"error": f"Failed to get messages: {str(e)}"}),
            status_code=500,
            mimetype="application/json"
        ))
