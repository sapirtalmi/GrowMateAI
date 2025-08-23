import azure.functions as func
import json
import logging
import os

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Simple negotiate function starting')
    
    # Handle CORS preflight
    if req.method == "OPTIONS":
        logging.info('Handling OPTIONS request')
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
        return func.HttpResponse(status_code=200, headers=headers)
    
    try:
        logging.info('Checking environment variables')
        
        # Get SignalR connection string
        connection_string = os.environ.get('AzureSignalRConnectionString')
        logging.info(f'Connection string exists: {bool(connection_string)}')
        
        if not connection_string:
            logging.error('No SignalR connection string found')
            error_response = {
                "error": "SignalR connection string not configured",
                "envVarCount": len(os.environ.keys()),
                "envVars": list(os.environ.keys())
            }
        else:
            logging.info('Connection string found, parsing...')
            
            # Parse connection string
            parts = {}
            for part in connection_string.split(';'):
                if '=' in part:
                    key, value = part.split('=', 1)
                    parts[key] = value
            
            endpoint = parts.get('Endpoint', '').rstrip('/')
            access_key = parts.get('AccessKey', '')
            
            logging.info(f'Parsed - Endpoint: {bool(endpoint)}, AccessKey: {bool(access_key)}')
            
            error_response = {
                "hasConnectionString": True,
                "connectionStringLength": len(connection_string),
                "hasEndpoint": bool(endpoint),
                "hasAccessKey": bool(access_key),
                "endpointPreview": endpoint[:50] if endpoint else "",
                "parts": list(parts.keys())
            }
        
        # Add CORS headers
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Content-Type': 'application/json'
        }
        
        return func.HttpResponse(
            json.dumps(error_response, indent=2),
            status_code=200,
            headers=headers,
            mimetype="application/json"
        )
        
    except Exception as e:
        logging.error(f"Error in simple negotiate: {str(e)}")
        logging.error(f"Error type: {type(e)}")
        
        error_response = {
            "error": str(e),
            "errorType": str(type(e))
        }
        
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Content-Type': 'application/json'
        }
        
        return func.HttpResponse(
            json.dumps(error_response),
            status_code=500,
            headers=headers,
            mimetype="application/json"
        )
