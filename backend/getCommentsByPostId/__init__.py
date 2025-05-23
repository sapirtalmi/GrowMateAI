from ..shared.utils import get_db_collections
import azure.functions as func
import json
from bson import ObjectId

collections = get_db_collections()
comment_collection = collections["CommunityComments"]

def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        post_id = req.params.get("postID")
        if not post_id:
            return func.HttpResponse("Missing postID", status_code=400)

        comments_cursor = comment_collection.find({"postID": ObjectId(post_id)}).sort("timestamp", 1)

        comments = []
        for c in comments_cursor:
            c["_id"] = str(c["_id"])
            c["userID"] = str(c["userID"])
            c["postID"] = str(c["postID"])
            comments.append(c)

        return func.HttpResponse(json.dumps(comments), mimetype="application/json")

    except Exception as e:
        return func.HttpResponse("Error retrieving comments", status_code=500)
