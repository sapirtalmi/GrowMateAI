from ..shared.utils import get_db_collections, get_user_id_from_token
import azure.functions as func
import json
import logging
from bson import ObjectId
from bson.errors import InvalidId

collections = get_db_collections()
post_collection = collections["CommunityPosts"]
user_collection = collections["Users"]

def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        auth = req.headers.get("Authorization")
        if not auth or not auth.startswith("Bearer "):
            return func.HttpResponse("Missing token", status_code=401)

        token = auth.split(" ")[1]
        user_id = get_user_id_from_token(token)
        user_object_id = ObjectId(user_id)

        posts_cursor = post_collection.find({
            "$or": [
                {"visibility": "public"},
                {"userID": user_object_id}
            ]
        }).sort("timestamp", -1)

        posts = []
        for p in posts_cursor:
            author = user_collection.find_one(
                {"_id": p["userID"]}, {"username": 1, "profileType": 1, "badges": 1}
            )
            p["_id"] = str(p["_id"])
            p["userID"] = str(p["userID"])
            p["username"] = author.get("username") if author else "Unknown"
            p["profileType"] = author.get("profileType", "amateur") if author else "amateur"
            p["badges"] = author.get("badges", []) if author else []
            posts.append(p)

        return func.HttpResponse(json.dumps(posts), mimetype="application/json")

    except Exception as e:
        logging.error(f"Error retrieving posts: {e}")
        return func.HttpResponse("Error retrieving posts", status_code=500)
