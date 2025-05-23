from ..shared.utils import get_db_collections, get_user_id_from_token
import azure.functions as func
import json
import logging
from bson import ObjectId
from datetime import datetime

collections = get_db_collections()
post_collection = collections["CommunityPosts"]

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("createCommunityPost triggered")

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
        return func.HttpResponse("Post created", status_code=201)

    except Exception as e:
        logging.error(f"Error: {e}")
        return func.HttpResponse("Internal server error", status_code=500)
