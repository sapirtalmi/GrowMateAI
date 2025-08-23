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
        
        # Check if connectionInfo is valid
        if connectionInfo is None:
            logging.error('SignalR connectionInfo is None')
            return corsify_response(func.HttpResponse(
                json.dumps({"error": "SignalR connection info not available"}),
                status_code=500,
                mimetype="application/json"
            ))
        
        # Try to convert connectionInfo to string/dict
        try:
            if hasattr(connectionInfo, '__dict__'):
                connection_data = connectionInfo.__dict__
                logging.info(f'ConnectionInfo dict: {connection_data}')
            else:
                connection_data = str(connectionInfo)
                logging.info(f'ConnectionInfo string: {connection_data}')
        except Exception as conv_err:
            logging.error(f'Error converting connectionInfo: {conv_err}')
            connection_data = "Unable to parse connection info"
        
        # Return the SignalR connection info
        response_body = connectionInfo
        logging.info(f'Returning connection info, type: {type(response_body)}')
        
        return corsify_response(func.HttpResponse(
            body=response_body,
            mimetype="application/json"
        ))
        
    except Exception as e:
        logging.error(f"Error in negotiate: {str(e)}")
        logging.error(f"Error type: {type(e)}")
        
        # Import traceback safely
        try:
            import traceback
            logging.error(f"Full traceback: {traceback.format_exc()}")
        except:
            logging.error("Could not get traceback")
        
        return corsify_response(func.HttpResponse(
            json.dumps({
                "error": f"Negotiate failed: {str(e)}",
                "errorType": str(type(e)),
                "hasConnectionString": bool(os.environ.get('AzureSignalRConnectionString'))
            }),
            status_code=500,
            mimetype="application/json"
        ))