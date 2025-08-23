from ..shared.utils import get_db_collections, get_user_id_from_token
import azure.functions as func
import json
import logging
from bson import ObjectId
from datetime import datetime

collections = get_db_collections()
users = collections["Users"]
posts = collections["CommunityPosts"]
comments = collections["CommunityComments"]
votes = collections["Votes"]  # Optional: to prevent duplicate votes

def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        auth = req.headers.get("Authorization")
        if not auth or not auth.startswith("Bearer "):
            return func.HttpResponse("Missing token", status_code=401)
        token = auth.split(" ")[1]
        voter_id = ObjectId(get_user_id_from_token(token))
    except:
        return func.HttpResponse("Invalid token", status_code=401)

    try:
        body = req.get_json()
        content_id = ObjectId(body.get("contentID"))
        vote_type = body.get("vote")  # "up" or "down"
        content_type = body.get("type")  # "post" or "comment"
    except:
        return func.HttpResponse("Invalid input", status_code=400)

    if vote_type not in ["up", "down"] or content_type not in ["post", "comment"]:
        return func.HttpResponse("Invalid vote or type", status_code=400)

    target_collection = posts if content_type == "post" else comments
    content = target_collection.find_one({"_id": content_id})
    if not content:
        return func.HttpResponse("Content not found", status_code=404)

    # Prevent voting on your own content
    if content["userID"] == voter_id:
        return func.HttpResponse("Cannot vote on your own content", status_code=403)

    # Prevent duplicate votes
    if votes.find_one({"voterID": voter_id, "contentID": content_id}):
        return func.HttpResponse("Already voted", status_code=409)

    # Apply vote
    field = "upvotes" if vote_type == "up" else "downvotes"
    target_collection.update_one({"_id": content_id}, {"$inc": {field: 1}})

    # Update author reputation
    author_id = content["userID"]
    rep_change = 1 if vote_type == "up" else -1
    users.update_one(
        {"_id": author_id},
        {
            "$inc": {
                "reputationScore": rep_change,
                "votesReceived": 1
            }
        }
    )

    # Store vote record
    votes.insert_one({
        "voterID": voter_id,
        "contentID": content_id,
        "contentType": content_type,
        "vote": vote_type,
        "timestamp": datetime.utcnow()
    })

    # Optional: assign badges based on reputation milestones
    try:
        assign_badges_to_user(author_id)
    except Exception as e:
        logging.error(f"Failed to assign badges: {e}")

    return func.HttpResponse("Vote recorded", status_code=200)


def assign_badges_to_user(user_id: ObjectId):
    user = users.find_one({"_id": user_id})
    if not user:
        return

    new_badges = []
    if user.get("reputationScore", 0) >= 50:
        new_badges.append("Rising Star")
    if user.get("votesReceived", 0) >= 100:
        new_badges.append("Community Favorite")

    if new_badges:
        users.update_one(
            {"_id": user_id},
            {"$addToSet": {"badges": {"$each": new_badges}}}
        )
