from ..shared.utils import get_db_collections
import azure.functions as func
import json
import logging
from bson import ObjectId
from bson.errors import InvalidId

collections = get_db_collections()
post_collection = collections["CommunityPosts"]

def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        post_id = req.params.get("id")
        if not post_id:
            return func.HttpResponse("Missing post ID", status_code=400)

        try:
            object_id = ObjectId(post_id)
        except InvalidId:
            return func.HttpResponse("Invalid post ID format", status_code=400)

        post = post_collection.find_one({ "_id": object_id })
        if not post:
            return func.HttpResponse("Post not found", status_code=404)

        post["_id"] = str(post["_id"])
        post["userID"] = str(post["userID"])
        return func.HttpResponse(json.dumps(post), mimetype="application/json")

    except Exception as e:
        logging.error(f"Error fetching post by ID: {e}")
        return func.HttpResponse("Internal server error", status_code=500)
