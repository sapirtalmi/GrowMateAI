# /futureGardens/{gardenId}  DELETE
import azure.functions as func
import logging
from bson import ObjectId
from ..shared.utils import get_user_id_from_token, get_db_collections

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("deleteFutureGarden triggered")
    auth = req.headers.get("Authorization","")
    if not auth.startswith("Bearer "): return func.HttpResponse("Unauthorized", status_code=401)

    try:
        user_oid = ObjectId(get_user_id_from_token(auth.split(" ")[1]))
    except Exception:
        return func.HttpResponse("Unauthorized", status_code=401)

    gid = req.route_params.get("gardenId")
    try:
        gid = ObjectId(gid)
    except Exception:
        return func.HttpResponse("Invalid id", status_code=400)

    try:
        col = get_db_collections()["FutureGardens"]
        res = col.delete_one({"_id": gid, "userId": user_oid})
        if res.deleted_count == 0:
            return func.HttpResponse("Not found", status_code=404)
        return func.HttpResponse(status_code=204)
    except Exception as e:
        logging.error(f"Error deleting garden: {e}")
        return func.HttpResponse("Internal server error", status_code=500)
