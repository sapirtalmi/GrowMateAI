import azure.functions as func
import json
import logging
import os
from shared.utils import corsify_response

def main(req: func.HttpRequest, connectionInfo: func.SignalRConnectionInfo) -> func.HttpResponse:
    logging.info('Processing SignalR negotiate request')
    
    # Handle CORS preflight
    if req.method == "OPTIONS":
        logging.info('Handling OPTIONS request')
        return corsify_response(func.HttpResponse(status_code=200))
    
    try:
        # Log environment info for debugging
        connection_string = os.environ.get('AzureSignalRConnectionString')
        logging.info(f'Connection string configured: {bool(connection_string)}')
        logging.info(f'Request method: {req.method}')
        logging.info(f'ConnectionInfo type: {type(connectionInfo)}')
        
        # Check if connectionInfo is valid
        if connectionInfo is None:
            logging.error('SignalR connectionInfo is None - check service mode')
            return corsify_response(func.HttpResponse(
                json.dumps({
                    "error": "SignalR connection info not available",
                    "hint": "Check if Azure SignalR Service is in 'Default' mode (not 'Serverless')"
                }),
                status_code=500,
                mimetype="application/json"
            ))
        
        logging.info('ConnectionInfo received successfully')
        logging.info(f'ConnectionInfo content: {connectionInfo}')
        
        # Return the SignalR connection info with CORS headers
        return corsify_response(func.HttpResponse(
            body=connectionInfo,
            status_code=200,
            mimetype="application/json"
        ))
        
    except Exception as e:
        logging.error(f"Error in negotiate: {str(e)}")
        logging.error(f"Error type: {type(e)}")
        
        try:
            import traceback
            logging.error(f"Full traceback: {traceback.format_exc()}")
        except:
            logging.error("Could not get traceback")
        
        return corsify_response(func.HttpResponse(
            json.dumps({
                "error": f"Negotiate failed: {str(e)}",
                "errorType": str(type(e)),
                "hasConnectionString": bool(os.environ.get('AzureSignalRConnectionString')),
                "hint": "Check Azure SignalR Service configuration and mode"
            }),
            status_code=500,
            mimetype="application/json"
        ))
