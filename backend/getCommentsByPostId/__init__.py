from ..shared.utils import get_db_collections
import azure.functions as func
import json
from bson import ObjectId
import logging
from bson.errors import InvalidId

collections = get_db_collections()
comment_collection = collections["CommunityComments"]
user_collection = collections["Users"]

def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        post_id = req.params.get("postID")
        if not post_id:
            return func.HttpResponse("Missing postID", status_code=400)

        post_object_id = ObjectId(post_id)
        comments_cursor = comment_collection.find({"postID": post_object_id}).sort("timestamp", 1)

        comments = []
        for c in comments_cursor:
            commenter = user_collection.find_one(
                {"_id": c["userID"]}, {"username": 1, "profileType": 1, "badges": 1}
            )
            c["_id"] = str(c["_id"])
            c["userID"] = str(c["userID"])
            c["postID"] = str(c["postID"])
            c["username"] = commenter.get("username") if commenter else "Unknown"
            c["profileType"] = commenter.get("profileType", "amateur") if commenter else "amateur"
            c["badges"] = commenter.get("badges", []) if commenter else []
            comments.append(c)

        return func.HttpResponse(json.dumps(comments), mimetype="application/json", status_code=200)

    except Exception as e:
        logging.error(f"Unexpected error: {e}")
        return func.HttpResponse("Error retrieving comments", status_code=500)
