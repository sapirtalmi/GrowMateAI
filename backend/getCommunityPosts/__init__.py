from ..shared.utils import get_db_collections, get_user_id_from_token
import azure.functions as func
import json
import logging
from bson import ObjectId
from bson.errors import InvalidId

collections = get_db_collections()
post_collection = collections["CommunityPosts"]

def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        auth = req.headers.get("Authorization")
        if not auth or not auth.startswith("Bearer "):
            return func.HttpResponse("Missing token", status_code=401)

        token = auth.split(" ")[1]
        user_id = get_user_id_from_token(token)
        
        try:

            user_object_id = ObjectId(user_id)
        except InvalidId:
            logging.error(f"Invalid ObjectId: {user_id}")
            return func.HttpResponse("Invalid user ID format", status_code=400)

        posts_cursor = post_collection.find({
            "$or": [
                {"visibility": "public"},
                { "userID": user_object_id }
            ]
        }).sort("timestamp", -1)

        posts = []
        for p in posts_cursor:
            p["_id"] = str(p["_id"])
            p["userID"] = str(p["userID"])
            posts.append(p)

        return func.HttpResponse(json.dumps(posts), mimetype="application/json")

    except Exception as e:
        logging.error(f"Error retrieving posts: {e}")
        return func.HttpResponse("Error retrieving posts", status_code=500)
