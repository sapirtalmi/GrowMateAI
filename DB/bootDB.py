from pymongo import MongoClient

# Replace with your actual connection string
uri = "mongodb://<username>:<password>@<your-cluster>.mongo.cosmos.azure.com:10255/?ssl=true&retrywrites=false"

# Connect to the client
client = MongoClient(uri)

# Use (or implicitly create) the database
db = client["myGardeningDB"]

#Here we define the collections we need:
required_collections = ["users", "devices", "sensors", "alerts"]

# Create collections if they don't already exist
existing_collections = db.list_collection_names()

for name in required_collections:
    if name not in existing_collections:
        db.create_collection(name)
        print(f"Created collection: {name}")



# Optional: Create unique indexes
db["users"].create_index("username", unique=True)
db["devices"].create_index("deviceId", unique=True)
