import azure.functions as func
import json
import logging
import os
import base64
import time
import hmac
import hashlib
import urllib.parse
from shared.utils import corsify_response

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Fixed SignalR negotiate request starting')
    
    # Handle CORS preflight
    if req.method == "OPTIONS":
        logging.info('Handling OPTIONS request')
        return corsify_response(func.HttpResponse(status_code=200))
    
    try:
        # Get SignalR connection string
        connection_string = os.environ.get('AzureSignalRConnectionString')
        
        if not connection_string:
            logging.error('SignalR connection string not found')
            return corsify_response(func.HttpResponse(
                json.dumps({"error": "SignalR connection string not configured"}),
                status_code=500,
                mimetype="application/json"
            ))
        
        # Parse connection string
        parts = {}
        for part in connection_string.split(';'):
            if '=' in part:
                key, value = part.split('=', 1)
                parts[key] = value
        
        endpoint = parts.get('Endpoint', '').rstrip('/')
        access_key = parts.get('AccessKey', '')
        
        if not endpoint or not access_key:
            logging.error('Invalid connection string format')
            return corsify_response(func.HttpResponse(
                json.dumps({"error": "Invalid connection string format"}),
                status_code=500,
                mimetype="application/json"
            ))
        
        # Generate access token for Azure SignalR using proper REST API format
        hub_name = "gardeningHub"
        user_id = "anonymous"  # Use anonymous user for now
        
        # Create the target URL
        target_url = f"{endpoint}/client/?hub={hub_name}"
        
        # Generate JWT token with proper claims for Azure SignalR
        now = int(time.time())
        exp = now + 3600  # 1 hour
        
        # Create JWT header
        header = {
            "typ": "JWT",
            "alg": "HS256"
        }
        
        # Create JWT payload with required claims for Azure SignalR
        payload = {
            "aud": target_url,
            "iat": now,
            "exp": exp,
            "nameid": user_id  # This is crucial for Azure SignalR
        }
        
        # Encode header and payload
        header_encoded = base64.urlsafe_b64encode(
            json.dumps(header, separators=(',', ':')).encode('utf-8')
        ).decode('utf-8').rstrip('=')
        
        payload_encoded = base64.urlsafe_b64encode(
            json.dumps(payload, separators=(',', ':')).encode('utf-8')
        ).decode('utf-8').rstrip('=')
        
        # Create the message to sign
        message = f"{header_encoded}.{payload_encoded}"
        
        # Decode the access key and create signature
        secret = base64.b64decode(access_key)
        signature = hmac.new(
            secret,
            message.encode('utf-8'),
            hashlib.sha256
        ).digest()
        
        signature_encoded = base64.urlsafe_b64encode(signature).decode('utf-8').rstrip('=')
        
        # Create the complete JWT token
        access_token = f"{message}.{signature_encoded}"
        
        logging.info(f'Generated JWT token length: {len(access_token)}')
        logging.info(f'Target URL: {target_url}')
        logging.info(f'User ID: {user_id}')
        
        # Return the negotiate response in the format expected by SignalR client
        response_data = {
            "url": target_url,
            "accessToken": access_token
        }
        
        logging.info('Successfully generated fixed connection info')
        
        return corsify_response(func.HttpResponse(
            json.dumps(response_data),
            status_code=200,
            mimetype="application/json"
        ))
        
    except Exception as e:
        logging.error(f"Error in fixed negotiate: {str(e)}")
        
        try:
            import traceback
            logging.error(f"Full traceback: {traceback.format_exc()}")
        except:
            logging.error("Could not get full traceback")
        
        return corsify_response(func.HttpResponse(
            json.dumps({
                "error": f"Fixed negotiate failed: {str(e)}"
            }),
            status_code=500,
            mimetype="application/json"
        ))
