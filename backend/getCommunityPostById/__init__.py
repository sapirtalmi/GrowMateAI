from ..shared.utils import get_db_collections
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
        post_id = req.params.get("id")
        if not post_id:
            return func.HttpResponse("Missing post ID", status_code=400)

        object_id = ObjectId(post_id)
        post = post_collection.find_one({"_id": object_id})
        if not post:
            return func.HttpResponse("Post not found", status_code=404)

        author = user_collection.find_one(
            {"_id": post["userID"]}, {"username": 1, "profileType": 1, "badges": 1}
        )

        post["_id"] = str(post["_id"])
        post["userID"] = str(post["userID"])
        post["username"] = author.get("username") if author else "Unknown"
        post["profileType"] = author.get("profileType", "amateur") if author else "amateur"
        post["badges"] = author.get("badges", []) if author else []

        return func.HttpResponse(json.dumps(post), mimetype="application/json")

    except Exception as e:
        logging.error(f"Error fetching post by ID: {e}")
        return func.HttpResponse("Internal server error", status_code=500)
