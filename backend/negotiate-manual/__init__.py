import azure.functions as func
import json
import logging
import os
import base64
import hmac
import hashlib
import time
from shared.utils import corsify_response

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Manual SignalR negotiate request starting')
    
    # Handle CORS preflight
    if req.method == "OPTIONS":
        logging.info('Handling OPTIONS request')
        return corsify_response(func.HttpResponse(status_code=200))
    
    try:
        logging.info('Checking for SignalR connection string')
        
        # Get SignalR connection string
        connection_string = os.environ.get('AzureSignalRConnectionString')
        logging.info(f'Connection string exists: {bool(connection_string)}')
        
        if not connection_string:
            logging.error('SignalR connection string not found')
            return corsify_response(func.HttpResponse(
                json.dumps({
                    "error": "SignalR connection string not configured",
                    "envVars": list(os.environ.keys())
                }),
                status_code=500,
                mimetype="application/json"
            ))
        
        logging.info('Parsing connection string')
        
        # Parse connection string
        parts = {}
        for part in connection_string.split(';'):
            if '=' in part:
                key, value = part.split('=', 1)
                parts[key] = value
        
        endpoint = parts.get('Endpoint', '').rstrip('/')
        access_key = parts.get('AccessKey', '')
        
        logging.info(f'Parsed endpoint: {endpoint[:50]}... (truncated)')
        logging.info(f'Has access key: {bool(access_key)}')
        
        if not endpoint or not access_key:
            logging.error('Invalid connection string format')
            return corsify_response(func.HttpResponse(
                json.dumps({
                    "error": "Invalid connection string format",
                    "hasEndpoint": bool(endpoint),
                    "hasAccessKey": bool(access_key),
                    "parts": list(parts.keys())
                }),
                status_code=500,
                mimetype="application/json"
            ))
        
        # Generate access token manually using simple JWT
        hub_name = "gardeningHub"
        
        logging.info('Generating JWT token')
        
        # Generate audience (SignalR URL) - this needs to be exact
        audience = f"{endpoint}/client/?hub={hub_name}"
        
        # JWT payload - Azure SignalR requires specific claims
        now = int(time.time())
        payload = {
            "aud": audience,
            "iat": now,
            "exp": now + 3600,  # 1 hour expiry
            "nameid": "user123"  # Add user identifier
        }
        
        # Create JWT manually (simplified version)
        header = {"alg": "HS256", "typ": "JWT"}
        
        # Encode header and payload - using proper JSON encoding
        header_json = json.dumps(header, separators=(',', ':'))
        payload_json = json.dumps(payload, separators=(',', ':'))
        
        header_encoded = base64.urlsafe_b64encode(header_json.encode()).decode().rstrip('=')
        payload_encoded = base64.urlsafe_b64encode(payload_json.encode()).decode().rstrip('=')
        
        # Create signature
        message = f"{header_encoded}.{payload_encoded}"
        secret = base64.b64decode(access_key)
        signature = hmac.new(secret, message.encode(), hashlib.sha256).digest()
        signature_encoded = base64.urlsafe_b64encode(signature).decode().rstrip('=')
        
        # Complete JWT
        token = f"{header_encoded}.{payload_encoded}.{signature_encoded}"
        
        logging.info(f'Generated token length: {len(token)}')
        logging.info(f'Token preview: {token[:50]}...')
        
        # Prepare response - Azure SignalR expects this exact format
        response_data = {
            "url": f"{endpoint}/client/?hub={hub_name}",
            "accessToken": token
        }
        
        logging.info('Successfully generated connection info')
        
        return corsify_response(func.HttpResponse(
            json.dumps(response_data),
            status_code=200,
            mimetype="application/json"
        ))
        
    except Exception as e:
        logging.error(f"Error in manual negotiate: {str(e)}")
        logging.error(f"Error type: {type(e)}")
        
        try:
            import traceback
            logging.error(f"Full traceback: {traceback.format_exc()}")
        except:
            logging.error("Could not get traceback")
        
        return corsify_response(func.HttpResponse(
            json.dumps({
                "error": f"Manual negotiate failed: {str(e)}",
                "errorType": str(type(e))
            }),
            status_code=500,
            mimetype="application/json"
        ))
