# /deleteFutureGarden/{gardenId}  DELETE
import azure.functions as func
import logging
from bson import ObjectId

# Be robust to package layout differences
try:
    from ..shared.utils import get_user_id_from_token, get_db_collections
except Exception:
    from shared.utils import get_user_id_from_token, get_db_collections

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("deleteFutureGarden triggered")

    # --- Auth ---
    auth = req.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return func.HttpResponse("Unauthorized", status_code=401)
    try:
        token = auth.split(" ")[1]
        user_oid = ObjectId(get_user_id_from_token(token))
    except Exception as e:
        logging.exception(f"Auth parse error: {e}")
        return func.HttpResponse("Unauthorized", status_code=401)

    # --- Id from route ---
    garden_id = req.route_params.get("gardenId")
    if not garden_id:
        return func.HttpResponse("Missing id", status_code=400)
    try:
        gid = ObjectId(garden_id)
    except Exception:
        return func.HttpResponse("Invalid id", status_code=400)

    try:
        col = get_db_collections()["FutureGardens"]

        # Debug who owns the doc
        doc = col.find_one({"_id": gid})
        logging.info(
            f"DELETE id={gid}, tokenUser={user_oid}, "
            f"docExists={bool(doc)}, docUser={doc.get('userId') if doc else None}"
        )

        if not doc:
            return func.HttpResponse("Not found", status_code=404)
        if doc.get("userId") != user_oid:
            return func.HttpResponse("Forbidden: not the owner", status_code=403)

        res = col.delete_one({"_id": gid})
        if res.deleted_count == 0:
            return func.HttpResponse("Not found", status_code=404)

        return func.HttpResponse(status_code=204)

    except Exception as e:
        logging.exception(f"Error deleting garden: {e}")
        return func.HttpResponse("Internal server error", status_code=500)
