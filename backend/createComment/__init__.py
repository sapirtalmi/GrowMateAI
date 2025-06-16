from ..shared.utils import get_db_collections, get_user_id_from_token
import azure.functions as func
import json
from bson import ObjectId
from datetime import datetime
import logging
from bson.errors import InvalidId

collections = get_db_collections()
comment_collection = collections["CommunityComments"]
user_collection = collections["Users"]

def main(req: func.HttpRequest) -> func.HttpResponse:
    auth_header = req.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return func.HttpResponse("Missing or invalid Authorization header", status_code=401)

    try:
        token = auth_header.split(" ")[1]
        user_id = get_user_id_from_token(token)
        user_object_id = ObjectId(user_id)
    except Exception as e:
        return func.HttpResponse(f"Unauthorized: {str(e)}", status_code=401)

    try:
        body = req.get_json()
        post_id = body.get("postID")
        content = body.get("content")
    except Exception as e:
        return func.HttpResponse("Invalid JSON body", status_code=400)

    if not post_id or not content:
        return func.HttpResponse("Missing postID or content", status_code=400)

    try:
        comment = {
            "postID": ObjectId(post_id),
            "userID": user_object_id,
            "content": content,
            "timestamp": datetime.utcnow().isoformat()
        }

        comment_collection.insert_one(comment)

        user = user_collection.find_one({"_id": user_object_id})
        new_badges = []

        if user.get("commentsCount", 0) == 0:
            new_badges.append("First Comment")
        elif user.get("commentsCount", 0) + 1 == 20:
            new_badges.append("Community Helper")

        user_collection.update_one(
            {"_id": user_object_id},
            {
                "$inc": {"commentsCount": 1},
                "$addToSet": {"badges": {"$each": new_badges}}
            }
        )

        # Update user stats
        user_collection.update_one(
            {"_id": user_object_id},
            {
                "$inc": {"commentsCount": 1},
                "$addToSet": {"badges": "First Comment"}
            }
        )

        return func.HttpResponse("Comment added", status_code=201)

    except Exception as e:
        return func.HttpResponse("Error adding comment", status_code=500)
