from ..shared.utils import generate_jwt, get_db_collections
import azure.functions as func
import logging
import bcrypt
import json


# MongoDB setup
collections = get_db_collections()
users_collection = collections["Users"]


def main(req: func.HttpRequest) -> func.HttpResponse:
    
    logging.info(f"AdminLogin function called with method: {req.method}")
    logging.info(f"Request headers: {dict(req.headers)}")
    
    # Handle CORS preflight requests
    if req.method == "OPTIONS":
        logging.info("Handling OPTIONS preflight request")
        return func.HttpResponse(
            "",
            status_code=200,
            headers={
                "Access-Control-Allow-Origin": "http://localhost:3001",
                "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Max-Age": "3600"
            }
        )
    
    try:
        logging.info("Processing POST request for admin login")
        req_body = req.get_json()
        logging.info(f"Request body received: {req_body}")
        
        email = req_body.get("email")
        password = req_body.get("password")

        if not email or not password:
            logging.warning("Missing email or password in request")
            return func.HttpResponse(
                "Missing email or password", 
                status_code=400,
                headers={
                    "Access-Control-Allow-Origin": "http://localhost:3001",
                    "Access-Control-Allow-Credentials": "true"
                }
            )

        # Look for admin user by email and check if they have admin role
        logging.info(f"Looking for admin user with email: {email}")
        admin_user = users_collection.find_one({
            "email": email,
            "role": "admin"  # Only allow users with admin role
        })
        
        if not admin_user:
            logging.warning(f"Admin not found or insufficient privileges for email: {email}")
            return func.HttpResponse(
                "Admin not found or insufficient privileges", 
                status_code=401,
                headers={
                    "Access-Control-Allow-Origin": "http://localhost:3001",
                    "Access-Control-Allow-Credentials": "true"
                }
            )

        # Check if password is set
        hashed_pw = admin_user.get("hashed_password")
        if not hashed_pw:
            return func.HttpResponse(
                "Password not set for admin", 
                status_code=500,
                headers={
                    "Access-Control-Allow-Origin": "http://localhost:3001",
                    "Access-Control-Allow-Credentials": "true"
                }
            )

        # Ensure hashed_pw is bytes
        if isinstance(hashed_pw, str):
            hashed_pw = hashed_pw.encode("utf-8")

        # Verify password
        if not bcrypt.checkpw(password.encode("utf-8"), hashed_pw):
            logging.warning(f"Invalid password for admin: {email}")
            return func.HttpResponse(
                "Invalid credentials", 
                status_code=401,
                headers={
                    "Access-Control-Allow-Origin": "http://localhost:3001",
                    "Access-Control-Allow-Credentials": "true"
                }
            )

        logging.info(f"Admin login successful for: {email}")
        # Generate JWT token with admin privileges
        payload = {
            "email": email,
            "user_id": str(admin_user["_id"]),
            "role": "admin",
            "username": admin_user.get("username", email)
        }
        token = generate_jwt(payload)

        logging.info("Returning successful login response")
        return func.HttpResponse(
            json.dumps({
                "token": token,
                "user": {
                    "id": str(admin_user["_id"]),
                    "email": email,
                    "name": admin_user.get("username", email),
                    "role": "admin"
                }
            }),
            status_code=200,
            mimetype="application/json",
            headers={
                "Access-Control-Allow-Origin": "http://localhost:3001",
                "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
                "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
                "Access-Control-Allow-Credentials": "true"
            }
        )

    except Exception as e:
        logging.error(f"Admin login error: {e}")
        return func.HttpResponse(
            "Internal server error", 
            status_code=500,
            headers={
                "Access-Control-Allow-Origin": "http://localhost:3001",
                "Access-Control-Allow-Credentials": "true"
            }
        )
