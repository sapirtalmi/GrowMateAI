import azure.functions as func
import logging
import json
import os
import openai
from ..shared.utils import get_user_id_from_token

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("planYourGarden function triggered")

    auth_header = req.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return func.HttpResponse("Missing or invalid Authorization header", status_code=401)

    token = auth_header.split(" ")[1]
    try:
        user_id = get_user_id_from_token(token)
    except Exception as e:
        logging.error(f"Token validation failed: {str(e)}")
        return func.HttpResponse("Invalid or expired token", status_code=401)

    try:
        req_body = req.get_json()
        environment = req_body.get("environment")
        sun_direction = req_body.get("sunDirection")
        sunlight_hours = req_body.get("sunlightHours")
        city = req_body.get("city")
        plant_pref = req_body.get("plantPreference")  # flowers, trees, herbs
        maintenance = req_body.get("maintenanceLevel")  # low/medium/high
        scent = req_body.get("scentPreference")  # scented/non-scented
        colors = req_body.get("colorPreference")  # green, colorful, red, etc.
        placement = req_body.get("placement")  # ground or planter

        if not all([environment, sun_direction, sunlight_hours, city]):
            return func.HttpResponse("Missing one or more required fields", status_code=400)

        prompt = (
            f"You are a smart gardening assistant helping someone plan a garden based on their environment.\n"
            f"User provided:\n"
            f"- Environment: {environment}\n"
            f"- Sun Direction: {sun_direction}\n"
            f"- Hours of Sunlight: {sunlight_hours}\n"
            f"- City: {city} (use it to infer climate)\n"
            f"- Plant Preference: {plant_pref or 'no preference'}\n"
            f"- Maintenance Level: {maintenance or 'no preference'}\n"
            f"- Scent Preference: {scent or 'no preference'}\n"
            f"- Color Preference: {colors or 'no preference'}\n"
            f"- Placement: {placement or 'no preference'}\n\n"
            f"Return a JSON object with:\n"
            f"- plants: list of objects with keys:\n"
            f"  - name\n"
            f"  - type (flower/tree/herb)\n"
            f"  - soil\n"
            f"  - watering\n"
            f"  - pruning\n"
            f"  - sunlightNeeds\n"
            f"  - scent\n"
            f"  - colors\n"
            f"  - maintenance\n"
            f"- additionalTips: list of expert tips\n"
            f"Only return a valid JSON object. No extra explanation or Markdown."
        )

        client = openai.OpenAI(api_key=os.environ["OPENAI_API_KEY"])
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1500
        )

        content = response.choices[0].message.content.strip()
        if content.startswith("```json"):
            content = content.replace("```json", "").strip()
        if content.endswith("```"):
            content = content[:-3].strip()

        parsed = json.loads(content)

        return func.HttpResponse(
            json.dumps(parsed),
            status_code=200,
            mimetype="application/json"
        )

    except Exception as e:
        logging.error(f"Error in planYourGarden: {str(e)}")
        return func.HttpResponse("Internal server error", status_code=500)
