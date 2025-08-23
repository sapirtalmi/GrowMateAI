import azure.functions as func
import json
import logging
import os
import requests
import base64
import time
import hmac
import hashlib
from shared.utils import corsify_response

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Diagnosing SignalR configuration and connectivity')
    
    # Handle CORS preflight
    if req.method == "OPTIONS":
        return corsify_response(func.HttpResponse(status_code=200))
    
    try:
        # Get SignalR connection string
        connection_string = os.environ.get('AzureSignalRConnectionString')
        
        if not connection_string:
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
        
        # Test connectivity to SignalR service
        hub_name = "gardeningHub"
        
        # Create test payload
        test_data = {
            "target": "testMessage",
            "arguments": ["Hello from diagnostic"]
        }
        
        # Generate authentication header for REST API call
        now = int(time.time())
        exp = now + 300  # 5 minutes
        
        # Create authorization string for REST API
        resource_uri = f"{endpoint}/api/v1/hubs/{hub_name}"
        string_to_sign = f"POST\n{resource_uri}\n{exp}"
        
        # Generate signature
        secret = base64.b64decode(access_key)
        signature = hmac.new(
            secret,
            string_to_sign.encode('utf-8'),
            hashlib.sha256
        ).digest()
        
        auth_token = base64.b64encode(signature).decode('utf-8')
        
        # Test SignalR REST API connectivity
        headers = {
            'Authorization': f'Bearer {auth_token}',
            'Content-Type': 'application/json'
        }
        
        try:
            # Try to get hub info using REST API
            info_url = f"{endpoint}/api/v1/hubs/{hub_name}"
            response = requests.get(info_url, headers=headers, timeout=10)
            
            rest_api_status = {
                "status_code": response.status_code,
                "accessible": response.status_code in [200, 404],  # 404 is OK for hub info
                "response_headers": dict(response.headers)
            }
            
        except Exception as rest_error:
            rest_api_status = {
                "error": str(rest_error),
                "accessible": False
            }
        
        # Return diagnostic information
        diagnostic_info = {
            "connection_string_status": {
                "has_connection_string": True,
                "has_endpoint": bool(endpoint),
                "has_access_key": bool(access_key),
                "endpoint": endpoint
            },
            "signalr_service_status": rest_api_status,
            "hub_name": hub_name,
            "recommendations": []
        }
        
        # Add recommendations based on findings
        if not rest_api_status.get("accessible", False):
            diagnostic_info["recommendations"].append(
                "SignalR service may not be accessible or in wrong mode. Check Azure portal."
            )
        
        if rest_api_status.get("status_code") == 401:
            diagnostic_info["recommendations"].append(
                "Authentication failed. Check if SignalR service is in 'Default' mode, not 'Serverless'."
            )
        
        logging.info(f'Diagnostic complete: {diagnostic_info}')
        
        return corsify_response(func.HttpResponse(
            json.dumps(diagnostic_info, indent=2),
            status_code=200,
            mimetype="application/json"
        ))
        
    except Exception as e:
        logging.error(f"Error in SignalR diagnosis: {str(e)}")
        
        return corsify_response(func.HttpResponse(
            json.dumps({
                "error": f"Diagnosis failed: {str(e)}"
            }),
            status_code=500,
            mimetype="application/json"
        ))
