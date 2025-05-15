from pymongo import MongoClient
import bcrypt
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Get the connection string
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = "SmartGardenDB"
COLLECTION_NAME = "users"

# User details
username = "tester"
password_plain = "tester123"
sensors = []

# Hash the password with bcrypt
salt = bcrypt.gensalt()
hashed_password = bcrypt.hashpw(password_plain.encode(), salt)

# Connect to MongoDB
client = MongoClient(MONGO_URI)
print("Connected to MongoDB")
db = client[DB_NAME]
collection = db[COLLECTION_NAME]

# Create user document
user_doc = {
    "username": username,
    "hashed_password": hashed_password.decode(),
    "sensors": sensors
}

# Insert into DB
result = collection.insert_one(user_doc)
print(f"User created with _id: {result.inserted_id}")
