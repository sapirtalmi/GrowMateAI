import azure.functions as func
import os
import requests
import json
from datetime import datetime
from collections import defaultdict

def main(req: func.HttpRequest) -> func.HttpResponse:
    city = req.params.get("city")
    if not city:
        return func.HttpResponse("Missing 'city' query parameter", status_code=400)

    api_key = os.environ.get("OPENWEATHER_API_KEY")
    if not api_key:
        return func.HttpResponse("API key not configured", status_code=500)

    try:
        # === Current weather ===
        current_url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=metric"
        current_res = requests.get(current_url)
        if current_res.status_code != 200:
            return func.HttpResponse(current_res.text, status_code=current_res.status_code)
        current = current_res.json()

        # === 5-day forecast ===
        forecast_url = f"http://api.openweathermap.org/data/2.5/forecast?q={city}&appid={api_key}&units=metric"
        forecast_res = requests.get(forecast_url)
        if forecast_res.status_code != 200:
            return func.HttpResponse(forecast_res.text, status_code=forecast_res.status_code)
        forecast_data = forecast_res.json()["list"]

        # === Aggregate by date ===
        daily_data = defaultdict(list)
        for entry in forecast_data:
            date_str = entry["dt_txt"].split()[0]
            daily_data[date_str].append(entry)

        forecast = []
        for date, entries in list(daily_data.items())[:5]:  # Get 5 days max
            temps = [e["main"]["temp"] for e in entries]
            pops = [e.get("pop", 0) for e in entries]
            descriptions = [e["weather"][0]["description"] for e in entries]
            icons = [e["weather"][0]["icon"] for e in entries]

            forecast.append({
                "date": date,
                "temp_min": round(min(temps)),
                "temp_max": round(max(temps)),
                "description": max(set(descriptions), key=descriptions.count),
                "icon": icons[0],  # just show first
                "pop": round(max(pops) * 100)  # percent
            })

        # === Smart tips ===
        tips = []
        if forecast and "rain" in forecast[0]["description"].lower():
            tips.append("💧 Tomorrow may rain – no need to water.")
        if forecast and forecast[0]["temp_max"] > 32:
            tips.append("☀️ Expect high temps – consider shading delicate plants.")

        # === Response ===
        response = {
            "city": current["name"],
            "current": {
                "temp": round(current["main"]["temp"]),
                "condition": current["weather"][0]["description"],
                "humidity": current["main"]["humidity"],
                "wind_speed": current["wind"]["speed"],
                "icon": current["weather"][0]["icon"]
            },
            "forecast": forecast,
            "tips": tips
        }

        return func.HttpResponse(json.dumps(response), mimetype="application/json")

    except Exception as e:
        return func.HttpResponse(f"Error: {str(e)}", status_code=500)
