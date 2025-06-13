def generate_sensor_prompt(sensor_doc: dict, plant_type: str) -> str:
    sensor_id = sensor_doc.get("sensorID", "unknown")
    data_entries = sensor_doc.get("data", [])
    
    prompt_lines = [
        f"Here is data collected from a sensor (ID: {sensor_id}) attached to the plant ({plant_type}):",
        ""
    ]
    
    for entry in data_entries:
        date = entry.get("Date", "unknown")
        temp = entry.get("Temperature", "N/A")
        humidity = entry.get("Humidity", "N/A")
        moisture = entry.get("SoilMoisture", "N/A")
        prompt_lines.append(f"- Date: {date} | Temperature: {temp}°C | Humidity: {humidity}% | SoilMoisture: {moisture}")
    
    prompt_lines += [
        "",
        'NOTE: "SoilMoisture": 1 = dry, "SoilMoisture": 4 = wet.',
        "NOTE: The problem may not be directly related to these parameters, but they may help."
    ]
    
    return "\n".join(prompt_lines)