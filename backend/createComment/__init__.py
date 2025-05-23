from ..shared.utils import get_db_collections, get_user_id_from_token
import azure.functions as func
import json
from bson import ObjectId
from datetime import datetime

collections = get_db_collections()
comment_collection = collections["CommunityComments"]

def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        auth = req.headers.get("Authorization")
        if not auth or not auth.startswith("Bearer "):
            return func.HttpResponse("Missing token", status_code=401)

        token = auth.split(" ")[1]
        user_id = get_user_id_from_token(token)
        user_object_id = ObjectId(user_id)

        body = req.get_json()
        post_id = body.get("postID")
        content = body.get("content")

        if not post_id or not content:
            return func.HttpResponse("Missing postID or content", status_code=400)

        comment = {
            "postID": ObjectId(post_id),
            "userID": user_object_id,
            "content": content,
            "timestamp": datetime.utcnow().isoformat()
        }

        comment_collection.insert_one(comment)
        return func.HttpResponse("Comment added", status_code=201)

    except Exception as e:
        return func.HttpResponse("Error adding comment", status_code=500)
