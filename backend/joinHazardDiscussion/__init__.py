import azure.functions as func
import json
import logging
from shared.utils import verify_jwt_token, corsify_response

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Processing join hazard discussion request')
    
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
        action = req_body.get('action', 'join')  # 'join' or 'leave'
        
        if not hazard_id:
            return corsify_response(func.HttpResponse(
                json.dumps({"error": "hazardId is required"}),
                status_code=400,
                mimetype="application/json"
            ))
        
        # For now, just return success since SignalR will handle group management
        # when messages are sent to specific group names
        return corsify_response(func.HttpResponse(
            json.dumps({
                "success": True,
                "message": f"Ready to {action} group hazard_{hazard_id}",
                "userId": user_id,
                "hazardId": hazard_id
            }),
            status_code=200,
            mimetype="application/json"
        ))
        
    except Exception as e:
        logging.error(f"Error managing hazard group: {str(e)}")
        return corsify_response(func.HttpResponse(
            json.dumps({"error": f"Failed to manage group: {str(e)}"}),
            status_code=500,
            mimetype="application/json"
        ))
