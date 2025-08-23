#!/usr/bin/env python3
"""
Fake Sensor Data Generator

This script sends fake sensor readings to the ingestSensorData Azure Function
to simulate real IoT sensor data for testing purposes.
"""

#python3 fake_sensor_simulator.py --sensor-id "SensorID"

import requests
import json
import time
import random
from datetime import datetime
import argparse

# Azure Function endpoint
INGEST_ENDPOINT = "https://smartgardeningfunctions.azurewebsites.net/api/ingestSensorData"

class SensorSimulator:
    def __init__(self, sensor_id):
        self.sensor_id = sensor_id
        # Base values for realistic sensor readings
        self.base_temp = 22.0  # °C
        self.base_humidity = 60.0  # %
        #self.base_moisture = 2.5  # 1-4 scale (1=very dry, 4=very wet)
        self.base_moisture = 1  # 1-4 scale (1=very dry, 4=very wet)
        # Variation ranges
        self.temp_variation = 5.0
        self.humidity_variation = 15.0
        #self.moisture_variation = 1.0  # ±1 on the 1-4 scale
        self.moisture_variation = 0  # ±1 on the 1-4 scale
        
    def generate_reading(self, watering_event=False):
        """Generate a realistic sensor reading"""
        
        # Add random variations to base values
        temperature = self.base_temp + random.uniform(-self.temp_variation, self.temp_variation)
        humidity = self.base_humidity + random.uniform(-self.humidity_variation, self.humidity_variation)
        moisture = self.base_moisture + random.uniform(-self.moisture_variation, self.moisture_variation)
        
        # If this is a watering event, increase soil moisture significantly
        if watering_event:
            moisture = min(4.0, moisture + random.uniform(1.0, 2.0))  # Boost moisture level
        
        # Ensure values are within realistic ranges
        temperature = max(10.0, min(40.0, temperature))
        humidity = max(20.0, min(95.0, humidity))
        moisture = max(1.0, min(4.0, moisture))  # Moisture scale 1-4
        
        return {
            "sensorID": self.sensor_id,
            "temperature": round(temperature, 1),
            "humidity": round(humidity, 1),
            "moisture": round(moisture, 1)  # Now on 1-4 scale
        }
    
    def send_reading(self, reading):
        """Send a sensor reading to the Azure Function"""
        try:
            response = requests.post(
                INGEST_ENDPOINT,
                json=reading,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            if response.status_code == 200:
                print(f"✅ [{datetime.now().strftime('%H:%M:%S')}] Sent reading for sensor {self.sensor_id}: "
                      f"Temp: {reading['temperature']}°C, Humidity: {reading['humidity']}%, "
                      f"Moisture: {reading['moisture']}/4")
                
                # Parse and display the server response
                try:
                    response_data = response.json()
                    print(f"📋 Server Response:")
                    print(f"   Message: {response_data.get('message', 'N/A')}")
                    print(f"   Watering Detected: {response_data.get('watering_detected', False)}")
                    
                    plants_needing_watering = response_data.get('plants_needing_watering', [])
                    if plants_needing_watering:
                        print(f"🚨 Plants Needing Watering: {', '.join(plants_needing_watering)}")
                        
                        # Show detailed watering alerts if available
                        watering_alerts = response_data.get('watering_alerts', [])
                        if watering_alerts:
                            print(f"📝 Watering Details:")
                            for alert in watering_alerts:
                                print(f"   - {alert.get('nickname', 'Unknown')} ({alert.get('plant_type', 'Unknown type')}): "
                                      f"{alert.get('days_since_watering', 0)} days since watering "
                                      f"(needs every {alert.get('watering_frequency', 'N/A')} days)")
                    else:
                        print(f"🌿 No plants need watering at this time")
                        
                except (ValueError, json.JSONDecodeError):
                    # Fallback for non-JSON responses
                    print(f"📋 Server Response: {response.text}")
                    
                return True
            else:
                print(f"❌ Failed to send reading. Status: {response.status_code}, Response: {response.text}")
                return False
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Error sending reading: {e}")
            return False

def simulate_single_reading(sensor_id, watering=False):
    """Send a single sensor reading"""
    simulator = SensorSimulator(sensor_id)
    reading = simulator.generate_reading(watering_event=watering)
    
    print(f"📡 Sending sensor reading for {sensor_id}...")
    print(f"   Data: {json.dumps(reading, indent=2)}")
    print("-" * 50)
    
    success = simulator.send_reading(reading)
    print("-" * 50)
    if success:
        print(f"✅ Successfully sent reading for sensor {sensor_id}")
    else:
        print(f"❌ Failed to send reading for sensor {sensor_id}")
    print()

def simulate_continuous_readings(sensor_ids, interval=30, duration=300):
    """Simulate continuous sensor readings"""
    simulators = {sid: SensorSimulator(sid) for sid in sensor_ids}
    
    print(f"🚀 Starting continuous simulation for {len(sensor_ids)} sensors")
    print(f"   Sensors: {', '.join(sensor_ids)}")
    print(f"   Interval: {interval} seconds")
    print(f"   Duration: {duration} seconds")
    print(f"   Total readings: {(duration // interval) * len(sensor_ids)}")
    print("-" * 60)
    
    start_time = time.time()
    reading_count = 0
    
    try:
        while time.time() - start_time < duration:
            for sensor_id in sensor_ids:
                simulator = simulators[sensor_id]
                
                # 10% chance of watering event
                watering_event = random.random() < 0.1
                if watering_event:
                    print(f"💧 Simulating watering event for sensor {sensor_id}")
                
                reading = simulator.generate_reading(watering_event=watering_event)
                
                if simulator.send_reading(reading):
                    reading_count += 1
            
            print(f"   Waiting {interval} seconds before next readings...")
            time.sleep(interval)
            
    except KeyboardInterrupt:
        print(f"\n⏹️  Simulation stopped by user")
    
    elapsed_time = time.time() - start_time
    print(f"\n📊 Simulation complete!")
    print(f"   Duration: {elapsed_time:.1f} seconds")
    print(f"   Readings sent: {reading_count}")
    print(f"   Success rate: {reading_count / (len(sensor_ids) * (elapsed_time // interval)) * 100:.1f}%")

def main():
    parser = argparse.ArgumentParser(description="Fake sensor data generator for GrowMateAI")
    parser.add_argument('--sensor-id', '-s', required=True, help='Sensor ID (or comma-separated list for multiple sensors)')
    parser.add_argument('--mode', '-m', choices=['single', 'continuous'], default='single',
                        help='Mode: single reading or continuous simulation')
    parser.add_argument('--watering', '-w', action='store_true',
                        help='Simulate watering event (higher moisture)')
    parser.add_argument('--interval', '-i', type=int, default=30,
                        help='Interval between readings in seconds (for continuous mode)')
    parser.add_argument('--duration', '-d', type=int, default=300,
                        help='Duration of simulation in seconds (for continuous mode)')
    
    args = parser.parse_args()
    
    # Parse sensor IDs
    sensor_ids = [sid.strip() for sid in args.sensor_id.split(',')]
    
    print(f"🌱 GrowMateAI Fake Sensor Data Generator")
    print(f"   Endpoint: {INGEST_ENDPOINT}")
    print("=" * 60)
    
    if args.mode == 'single':
        for sensor_id in sensor_ids:
            simulate_single_reading(sensor_id, watering=args.watering)
            if len(sensor_ids) > 1:
                time.sleep(1)  # Small delay between sensors
    else:
        simulate_continuous_readings(sensor_ids, args.interval, args.duration)

if __name__ == "__main__":
    main()
