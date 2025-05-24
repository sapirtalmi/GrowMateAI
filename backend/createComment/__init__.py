from ..shared.utils import get_db_collections, get_user_id_from_token
import azure.functions as func
import json
from bson import ObjectId
from datetime import datetime
import logging

collections = get_db_collections()
comment_collection = collections["CommunityComments"]

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("createComment function triggered")

    auth_header = req.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return func.HttpResponse("Missing or invalid Authorization header", status_code=401)

    token = auth_header.split(" ")[1]
    try:
        user_id = get_user_id_from_token(token)
        logging.info(f"Decoded user ID: {user_id}")
        user_object_id = ObjectId(user_id)
    except Exception as e:
        logging.error(f"Token validation or ObjectId conversion failed: {e}")
        return func.HttpResponse(f"Unauthorized: {str(e)}", status_code=401)

    try:
        body = req.get_json()
        post_id = body.get("postID")
        content = body.get("content")
    except Exception as e:
        logging.error(f"Invalid JSON body: {e}")
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
        logging.info(f"Comment added to post {post_id} by user {user_id}")
        return func.HttpResponse("Comment added", status_code=201)

    except Exception as e:
        logging.error(f"Error inserting comment: {e}")
        return func.HttpResponse("Error adding comment", status_code=500)
