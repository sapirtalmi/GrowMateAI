import azure.functions as func
import json
import logging
import os
from shared.utils import corsify_response

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Testing SignalR configuration')
    
    # Handle CORS preflight
    if req.method == "OPTIONS":
        return corsify_response(func.HttpResponse(status_code=200))
    
    try:
        # Get SignalR connection string
        connection_string = os.environ.get('AzureSignalRConnectionString')
        
        if not connection_string:
            logging.error('SignalR connection string not found')
            return corsify_response(func.HttpResponse(
                json.dumps({
                    "error": "SignalR connection string not configured",
                    "envVars": [k for k in os.environ.keys() if 'signal' in k.lower()]
                }),
                status_code=500,
                mimetype="application/json"
            ))
        
        # Parse connection string
        parts = {}
        for part in connection_string.split(';'):
            if '=' in part:
                key, value = part.split('=', 1)
                parts[key] = value
        
        endpoint = parts.get('Endpoint', '')
        access_key = parts.get('AccessKey', '')
        
        # Check Azure SignalR Service mode by trying to access the service info
        try:
            # Basic validation of connection string format
            config_info = {
                "hasConnectionString": True,
                "hasEndpoint": bool(endpoint),
                "hasAccessKey": bool(access_key),
                "endpoint": endpoint[:50] + "..." if len(endpoint) > 50 else endpoint,
                "connectionStringFormat": "valid" if endpoint and access_key else "invalid"
            }
            
            logging.info(f'SignalR config: {config_info}')
            
            return corsify_response(func.HttpResponse(
                json.dumps({
                    "status": "SignalR configuration found",
                    "config": config_info
                }),
                status_code=200,
                mimetype="application/json"
            ))
            
        except Exception as parse_error:
            logging.error(f'Error parsing connection string: {str(parse_error)}')
            return corsify_response(func.HttpResponse(
                json.dumps({
                    "error": f"Failed to parse connection string: {str(parse_error)}"
                }),
                status_code=500,
                mimetype="application/json"
            ))
        
    except Exception as e:
        logging.error(f"Error testing SignalR config: {str(e)}")
        
        return corsify_response(func.HttpResponse(
            json.dumps({
                "error": f"Configuration test failed: {str(e)}"
            }),
            status_code=500,
            mimetype="application/json"
        ))
