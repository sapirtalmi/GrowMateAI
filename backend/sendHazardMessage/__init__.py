import azure.functions as func
import json
import logging
from datetime import datetime
from shared.utils import get_mongo_client, verify_jwt_token, corsify_response

def main(req: func.HttpRequest, signalRMessages: func.Out[str]) -> func.HttpResponse:
    logging.info('Processing send hazard message request')
    
    # Handle CORS preflight
    if req.method == "OPTIONS":
        return corsify_response(func.HttpResponse(status_code=200))
    
    try:
        # Verify JWT token
        token_result = verify_jwt_token(req)
        if isinstance(token_result, func.HttpResponse):
            return corsify_response(token_result)
        
        user_id = token_result
        
        # Parse request body
        req_body = req.get_json()
        if not req_body:
            return corsify_response(func.HttpResponse(
                json.dumps({"error": "Request body is required"}),
                status_code=400,
                mimetype="application/json"
            ))
        
        hazard_id = req_body.get('hazardId')
        message_text = req_body.get('message')
        username = req_body.get('username', f'User_{user_id[:8]}')
        
        if not hazard_id or not message_text:
            return corsify_response(func.HttpResponse(
                json.dumps({"error": "hazardId and message are required"}),
                status_code=400,
                mimetype="application/json"
            ))
        
        # Create message object
        message = {
            "id": f"{datetime.utcnow().timestamp()}_{user_id}",
            "hazardId": hazard_id,
            "userId": user_id,
            "username": username,
            "message": message_text,
            "timestamp": datetime.utcnow().isoformat(),
            "created_at": datetime.utcnow()
        }
        
        # Store message in MongoDB
        client = get_mongo_client()
        db = client['gardeningDB']
        collection = db['hazardMessages']
        
        # Insert message
        collection.insert_one(message)
        
        # Prepare message for SignalR (remove MongoDB ObjectId for JSON serialization)
        signalr_message = {
            "id": message["id"],
            "hazardId": message["hazardId"],
            "userId": message["userId"],
            "username": message["username"],
            "message": message["message"],
            "timestamp": message["timestamp"]
        }
        
        # Send to SignalR group
        signalr_data = {
            "target": "newMessage",
            "arguments": [signalr_message],
            "groupName": f"hazard_{hazard_id}"
        }
        
        signalRMessages.set(json.dumps(signalr_data))
        
        return corsify_response(func.HttpResponse(
            json.dumps({
                "success": True,
                "message": signalr_message
            }),
            status_code=200,
            mimetype="application/json"
        ))
        
    except Exception as e:
        logging.error(f"Error sending hazard message: {str(e)}")
        return corsify_response(func.HttpResponse(
            json.dumps({"error": f"Failed to send message: {str(e)}"}),
            status_code=500,
            mimetype="application/json"
        ))
