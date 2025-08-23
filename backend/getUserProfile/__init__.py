from ..shared.utils import get_user_id_from_token, get_db_collections
import azure.functions as func
import json
import logging
from bson import ObjectId

collections = get_db_collections()
users_collection = collections["Users"]

def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        auth = req.headers.get("Authorization")
        if not auth or not auth.startswith("Bearer "):
            return func.HttpResponse("Missing or invalid token", status_code=401)
        
        token = auth.split(" ")[1]
        user_id = get_user_id_from_token(token)
        user_object_id = ObjectId(user_id)

        user = users_collection.find_one({"_id": user_object_id})
        if not user:
            return func.HttpResponse("User not found", status_code=404)

        profile = {
            "username": user.get("username"),
            "profileType": user.get("profileType"),
            "badges": user.get("badges", []),
            "reputationScore": user.get("reputationScore", 0),
            "votesReceived": user.get("votesReceived", 0),
            "postsCount": user.get("postsCount", 0),
            "commentsCount": user.get("commentsCount", 0)
        }

        return func.HttpResponse(
            json.dumps(profile),
            status_code=200,
            mimetype="application/json"
        )

    except Exception as e:
        logging.error(f"Error retrieving user profile: {e}")
        return func.HttpResponse("Internal server error", status_code=500)
