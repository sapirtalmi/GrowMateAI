# This script is used to test the OpenAI API with a simple chat completion request.

import openai
import os
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

client = openai.OpenAI(api_key=os.getenv("KEY"))

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "user", "content": "what is the best way to grow tomatoes in a small garden?"}
    ]
)

print(response.choices[0].message.content)
