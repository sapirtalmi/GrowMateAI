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
        # Check environment variables
        connection_string = os.environ.get('AzureSignalRConnectionString')
        
        result = {
            "hasConnectionString": bool(connection_string),
            "connectionStringLength": len(connection_string) if connection_string else 0,
            "connectionStringPreview": connection_string[:30] + "..." if connection_string else None,
            "allEnvVars": list(os.environ.keys()),
            "signalRVars": [key for key in os.environ.keys() if 'signalr' in key.lower()]
        }
        
        return corsify_response(func.HttpResponse(
            json.dumps(result, indent=2),
            status_code=200,
            mimetype="application/json"
        ))
        
    except Exception as e:
        logging.error(f"Error in test: {str(e)}")
        return corsify_response(func.HttpResponse(
            json.dumps({"error": str(e)}),
            status_code=500,
            mimetype="application/json"
        ))
