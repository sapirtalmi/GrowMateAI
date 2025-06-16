from ..shared.utils import get_db_collections, get_user_id_from_token
import azure.functions as func
import json
import logging
from bson import ObjectId
from datetime import datetime

collections = get_db_collections()
post_collection = collections["CommunityPosts"]
user_collection = collections["Users"]

def main(req: func.HttpRequest) -> func.HttpResponse:
    auth = req.headers.get("Authorization")
    if not auth or not auth.startswith("Bearer "):
        return func.HttpResponse("Missing token", status_code=401)

    try:
        token = auth.split(" ")[1]
        user_id = get_user_id_from_token(token)
        user_object_id = ObjectId(user_id)

        body = req.get_json()
        title = body.get("title")
        content = body.get("content")
        visibility = body.get("visibility", "public")
        plant_name = body.get("plantName", "")

        if not title or not content:
            return func.HttpResponse("Missing title or content", status_code=400)

        post = {
            "userID": user_object_id,
            "title": title,
            "content": content,
            "plantName": plant_name,
            "visibility": visibility,
            "timestamp": datetime.utcnow().isoformat()
        }

        post_collection.insert_one(post)

        user = user_collection.find_one({"_id": user_object_id})
        new_badges = []

        if user.get("postsCount", 0) == 0:
            new_badges.append("First Post")
        elif user.get("postsCount", 0) + 1 == 10:
            new_badges.append("Active Poster")

        user_collection.update_one(
            {"_id": user_object_id},
            {
                "$inc": {"postsCount": 1},
                "$addToSet": {"badges": {"$each": new_badges}}
            }
        )

        # Update user stats
        user_collection.update_one(
            {"_id": user_object_id},
            {
                "$inc": {"postsCount": 1},
                "$addToSet": {"badges": "First Post"}
            }
        )

        return func.HttpResponse("Post created", status_code=201)

    except Exception as e:
        logging.error(f"Error: {e}")
        return func.HttpResponse("Internal server error", status_code=500)
