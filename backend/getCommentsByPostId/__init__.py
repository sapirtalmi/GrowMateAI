from ..shared.utils import get_db_collections
import azure.functions as func
import json
from bson import ObjectId
import logging

collections = get_db_collections()
comment_collection = collections["CommunityComments"]

def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        post_id = req.params.get("postID")
        logging.info(f"Received postID: {post_id}")

        if not post_id:
            return func.HttpResponse("Missing postID", status_code=400)

        try:
            post_object_id = ObjectId(post_id)
        except Exception as e:
            logging.error(f"Invalid ObjectId: {e}")
            return func.HttpResponse("Invalid postID format", status_code=400)

        comments_cursor = comment_collection.find({"postID": post_object_id}).sort("timestamp", 1)

        comments = []
        for c in comments_cursor:
            c["_id"] = str(c["_id"])
            c["userID"] = str(c["userID"])
            c["postID"] = str(c["postID"])
            comments.append(c)

        logging.info(f"Returning {len(comments)} comments")
        return func.HttpResponse(json.dumps(comments), mimetype="application/json", status_code=200)

    except Exception as e:
        logging.error(f"Unexpected error: {e}")
        return func.HttpResponse("Error retrieving comments", status_code=500)
