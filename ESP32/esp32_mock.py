import argparse
import json
import random
import time
import requests  # Only needed if you want to send over HTTP

def generate_sensor_data():
    return {
        "sensorID": "sensor123123",
        "humidity": round(random.uniform(20, 60), 2),
        "temperature": round(random.uniform(18, 30), 2),
        "moisture": random.randint(1, 4)
    }

def send_data(data, endpoint='https://smartgardeningfunctions.azurewebsites.net/api/ingestsensordata'):
    print("Sending data...")
    if endpoint:
        try:
            print("Sending data to endpoint:", endpoint)
            response = requests.post(endpoint, json=data)
            if response.status_code == 500:
                print(f"Error 500: {response.text}")
            else:
                print(f"Sent to {endpoint}: {data} | Status: {response.status_code}")
        except requests.RequestException as e:
            print(f"Failed to send data: {e}")
    else:
        print("Mock Data:", json.dumps(data, indent=2))

def run_timed(interval, endpoint=None):
    while True:
        data = generate_sensor_data()
        send_data(data, endpoint)
        time.sleep(interval)

def run_manual(endpoint='https://smartgardeningfunctions.azurewebsites.net/api/ingestsensordata'):
    print("Press ENTER to send data. Ctrl+C to exit.")
    while True:
        input()
        data = generate_sensor_data()
        send_data(data, endpoint)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="ESP32 Mock Sensor Script")
    parser.add_argument("--mode", choices=["timed", "manual"], default="manual", help="Mode of operation")
    parser.add_argument("--interval", type=int, default=5, help="Interval in seconds (timed mode only)")
    parser.add_argument("--endpoint", type=str, help="Optional HTTP endpoint to send data to")

    args = parser.parse_args()

    if args.mode == "timed":
        run_timed(args.interval, args.endpoint)
    else:
        run_manual(args.endpoint)