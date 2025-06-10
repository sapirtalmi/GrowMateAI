import azure.functions as func
import logging
import json
import os
import openai
from ..shared.utils import get_user_id_from_token  # adjust import path as needed

def main(req: func.HttpRequest) -> func.HttpResponse:
    logging.info("plantDiagnosis function triggered")

    # 🔐 Validate JWT Token
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
        plant_type = req_body.get("plantType")
        complaint = req_body.get("complaint")
        image_base64 = req_body.get("imageBase64")

        if not plant_type or not complaint or not image_base64:
            return func.HttpResponse("Missing one or more fields: plantType, complaint, imageBase64", status_code=400)

        # 🧠 Build ChatGPT input
        message = {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": (
                        f"You are a bot that helps detect problems in plants based on user complaints and photos.\n"
                        f"Here is the situation:\n"
                        f"Plant type: {plant_type}\n"
                        f"User complaint: {complaint}\n"
                        f"Please analyze the image and determine if there is a visible problem with the plant.\n"
                        f"If a problem is detected, provide a short explanation and specific suggestions to fix it.\n\n"
                        f"Return your response as a JSON object with the following fields:\n"
                        f"- problem: (string) short description of the detected issue, or 'none' if healthy\n"
                        f"- severity: (string) one of: 'low', 'moderate', 'high', or 'none'\n"
                        f"- suggestions: (list of strings) actionable care tips, or an empty list if the plant is healthy\n"
                        f"Important: If no issue is detected, return: {{\"problem\": \"none\", \"severity\": \"none\", \"suggestions\": []}}\n"
                        f"Only return the JSON object. Do not include explanation or markdown."
                    )   

                },
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{image_base64}"
                    }
                }
            ]
        }
        client = openai.OpenAI(api_key=os.environ["OPENAI_API_KEY"])

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[message],
            max_tokens=1000
        )

        content = response.choices[0].message.content.strip()
        # Remove Markdown formatting if present
        if content.startswith("```json"):
            content = content.replace("```json", "").strip()
        if content.endswith("```"):
            content = content[:-3].strip()

        parsed = json.loads(content)

        print(parsed)

        return func.HttpResponse(
            json.dumps(parsed),
            status_code=200,
            mimetype="application/json"
        )

    except Exception as e:
        print(e)
        logging.error(f"Error in plantDiagnosis: {str(e)}")
        return func.HttpResponse("Internal server error", status_code=500)