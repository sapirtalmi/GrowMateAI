import openai
import os
import base64
from dotenv import load_dotenv

# Load API key
load_dotenv()
client = openai.OpenAI(api_key=os.getenv("KEY"))

# Base64-encode image
def encode_image_to_base64(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")

# Path to your plant image
image_path = "basil.png"  # replace with your image file
base64_image = encode_image_to_base64(image_path)

# Create the request
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "This is a photo of my basil. Can you detect any problem and suggest how to take care of it?"},
                {
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{base64_image}"
                    }
                }
            ]
        }
    ],
    max_tokens=1000
)

# Print the result
print(response.choices[0].message.content)
