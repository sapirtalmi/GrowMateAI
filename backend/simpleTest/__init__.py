import azure.functions as func
import json
import logging
import os

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Simple test function starting')
    
    try:
        # Basic response
        response_data = {
            "status": "working",
            "method": req.method,
            "url": req.url,
            "hasConnectionString": bool(os.environ.get('AzureSignalRConnectionString')),
            "connectionStringLength": len(os.environ.get('AzureSignalRConnectionString', '')),
            "allEnvVars": len(os.environ.keys()),
            "timestamp": "test"
        }
        
        logging.info(f'Response data: {response_data}')
        
        # Add CORS headers manually
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Content-Type': 'application/json'
        }
        
        return func.HttpResponse(
            json.dumps(response_data),
            status_code=200,
            headers=headers,
            mimetype="application/json"
        )
        
    except Exception as e:
        logging.error(f"Error in simple test: {str(e)}")
        
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
