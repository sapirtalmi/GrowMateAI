#include <WiFi.h>
#include <WiFiClient.h>
#include <WebServer.h>
#include <Preferences.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

#include "DHT.h"

// ---------------------- Sensor Setup ----------------------
#define MOISTURE_PIN 0
#define DHTPIN 1
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);
bool configMode = false;

Preferences preferences;
WebServer server(80);

bool isProvisioned = false;
bool testerMode = true;  // Disable HTTP post if true

const char* endpoint = "https://smartgardeningfunctions.azurewebsites.net/api/SignalProcessing";

int normalizeMoisture(int rawValue) {
  if (rawValue <= 2000) return 4;
  else if (rawValue <= 2600) return 3;
  else if (rawValue <= 3300) return 2;
  else return 1;
}

void handleRoot() {
  server.send(200, "text/plain", "ESP32 is in config mode");
}


void handleConfigure() {
  if (server.method() != HTTP_POST) {
    server.send(405, "text/plain", "Method Not Allowed");
    return;
  }

  Serial.println("Handle Post Req");

  // Read raw JSON body
  String body = server.arg("plain");

  // Parse JSON
  StaticJsonDocument<256> json;
  DeserializationError error = deserializeJson(json, body);
  if (error) {
    Serial.println("Failed to parse JSON");
    server.send(400, "application/json", "{\"error\":\"Invalid JSON\"}");
    return;
  }

  String ssid = json["ssid"] | "";
  String password = json["password"] | "";

  Serial.print("Received SSID: ");
  Serial.println(ssid);
  Serial.print("Received Password: ");
  Serial.println(password);

  if (ssid.length() == 0 || password.length() == 0) {
    server.send(400, "application/json", "{\"error\":\"Missing ssid or password\"}");
    return;
  }

  preferences.begin("wifi", false);
  preferences.putString("ssid", ssid);
  preferences.putString("password", password);
  preferences.end();

  server.send(200, "application/json", "{\"status\": \"saved\"}");

  delay(1000);
  ESP.restart();
}

void startSoftAP() {
  configMode = true;
  WiFi.softAP("PlantSensor_1234", "plantpass");
  Serial.println("Started AP: PlantSensor_1234");

  server.on("/", handleRoot);
  server.on("/configure", handleConfigure);
  server.begin();

  Serial.println("HTTP server started in AP mode");
}

bool connectToWiFi() {
  Serial.print("connectToWiFi");
  preferences.begin("wifi", true);
  String ssid = preferences.getString("ssid", "");
  String password = preferences.getString("password", "");
  preferences.end();

  if (ssid == "") return false;

  WiFi.begin(ssid.c_str(), password.c_str());
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);

  for (int i = 0; i < 20; ++i) {
    if (WiFi.status() == WL_CONNECTED) {
      Serial.println("Connected to WiFi!");
      return true;
    }
    delay(500);
    Serial.print(".");
  }

  Serial.println("Failed to connect to WiFi");
  return false;
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  //Just for tests!!
  // preferences.begin("wifi", false);
  // preferences.clear();   // or preferences.remove("ssid"); preferences.remove("password");
  // preferences.end();
  //
  Serial.println("HTTP server started in AP mode");
  dht.begin();

  if (!connectToWiFi()) {
    startSoftAP();  // fallback if no Wi-Fi or failed connection
    return;
  }
  configMode = false;

  // Connected to Wi-Fi, start normal operation
}

void loop() {
  if (configMode) {
    server.handleClient();
    delay(10);
    return;
  }

  int moistureValue = normalizeMoisture(analogRead(MOISTURE_PIN));
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();

  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("Failed to read from DHT sensor!");
    delay(2000);
    return;
  }

  Serial.print("Soil Moisture: ");
  Serial.println(moistureValue);
  Serial.println(analogRead(MOISTURE_PIN));
  Serial.print("Temperature: ");
  Serial.print(temperature);
  Serial.print("°C  |  Humidity: ");
  Serial.print(humidity);
  Serial.println("%");

  if ((WiFi.status() == WL_CONNECTED) && (testerMode != true)) {
    HTTPClient http;
    http.begin(endpoint);
    http.addHeader("Content-Type", "application/json");

    String jsonPayload = "{";
    jsonPayload += "\"sensorID\": \"sensor123123\",";
    jsonPayload += "\"Humidity\": " + String(humidity, 2) + ",";
    jsonPayload += "\"Temperature\": " + String(temperature, 2) + ",";
    jsonPayload += "\"SoilMoisture\": " + String(moistureValue);
    jsonPayload += "}";

    int httpResponseCode = http.POST(jsonPayload);
    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);
    String response = http.getString();
    Serial.println("Response: " + response);
    http.end();
  } else {
    Serial.println("WiFi disconnected or in tester mode!");
  }

  delay(5000);
}
