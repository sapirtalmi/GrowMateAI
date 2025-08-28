# GrowMateAI

GrowMateAI is an end-to-end smart gardening solution that combines IoT hardware, cloud-based serverless architecture, and AI analytics to monitor, diagnose, and optimize home or commercial gardens.

Built with custom ESP32-C3 sensors, a React Native mobile app, and a Python backend on Azure Functions, GrowMateAI delivers real-time insights and intelligent automation for plant care.

[Check out our website for more details!](https://sapirtalmi.github.io/GrowMateAI/#home)

---

## Project Vision

Traditional gardening often relies on trial and error—when to water, how to identify stress, or which plants thrive where. GrowMateAI eliminates the guesswork using sensor data, AI-powered diagnosis, and community-driven learning to assist all types of gardeners.

---

## Architecture Overview

| Layer    | Technology Stack                                      |
|----------|-------------------------------------------------------|
| IoT      | ESP32-C3, DHT22, Soil Moisture, Light Sensors         |
| Backend  | Azure Functions (Python), OpenAI API                  |
| Frontend | React Native (Expo), React Hooks, react-native-paper  |

---

## ESP32

This folder contains code for ESP32-based sensor devices and simulation scripts.

### Purpose
- Simulate and operate sensor devices that send data to the GrowMate backend.

### Files
- `esp32_mock.py`: Python script to simulate sensor data and send it to the backend API. Supports timed and manual modes.
- `Sensor.ino`: Arduino firmware for ESP32 devices. Handles WiFi setup, sensor readings (moisture, temperature, humidity), and HTTP communication with the backend.

### Usage
- Use `esp32_mock.py` for local testing and simulation of sensor data.
- Flash `Sensor.ino` to an ESP32 device for real sensor operation.

---

## App Structure

### 📱 Frontend – React Native (Expo)

**Folder Structure:**
```bash
app/        # Navigation and screen components
assets/     # Static assets like icons and images
services/   # API calls and external integrations
src/        # Shared components, hooks, styles, utils
```

### Backend – Azure Functions

Each function is a microservice:
- `ingestSensorData/` – Collect & store sensor readings
- `diagnoseSignalR/` – AI-powered plant diagnosis
- `getSensorHistory/`, `getWeatherForecast/` – Historical/environmental data
- `register/`, `login/`, `getUserProfile/` – Auth & user management
- `createCommunityPost/`, `voteContent/` – Garden community interactions
- `sendHazardMessage/` – Real-time hazard alerts

*This is a high-level overview — not all functions are listed here. See the backend source code for the complete set.*

---
## ESP32

This folder contains code for ESP32-based sensor devices and simulation scripts.

### Purpose
Simulate and operate sensor devices that send data to the GrowMate backend.

### Files
- `esp32_mock.py`: Python script to simulate sensor data and send it to the backend API. Supports timed and manual modes.
- `Sensor.ino`: Arduino firmware for ESP32 devices. Handles WiFi setup, sensor readings (moisture, temperature, humidity), and HTTP communication with the backend.

### Usage
- Use `esp32_mock.py` for local testing and simulation of sensor data.
- Flash `Sensor.ino` to an ESP32 device for real sensor operation.

---
## FrontendProviders

This folder contains the frontend for the GrowMate Providers Control Dashboard.

### Purpose
The dashboard enables providers to manage users, hazards, sensors, and plants in the GrowMate system.

### Features
- User management (view, update, delete users)
- Hazard monitoring and control
- Sensor management and visualization (including map view)
- Authentication and secure access

### Tech Stack
- React
- Leaflet (maps)
- Axios (API requests)
- React Router

### Quick Start
To set up, run `start.sh` in the `FrontendProviders` directory. This checks Node.js requirements and installs dependencies:

```bash
cd FrontendProviders
./start.sh
```

### Structure
- `src/components/`: Reusable UI components (Navbar, HazardsMap, etc.)
- `src/pages/`: Main dashboard pages (Dashboard, UsersPage, HazardsPage, SensorsPage, LoginPage)
- `src/services/api.js`: API configuration and request logic

---

## Mobile App – Features & Stack

### Key Features

- **Real-time Monitoring** – Soil, humidity, light, and temperature  
- **AI Diagnosis** – ChatGPT-generated care tips  
- **Garden Planner** – Optimize layout and plant types  
- **Community Feed** – Post, like, comment, and share  
- **Alerts** – Watering reminders, hazard detection  
- **Authentication** – Secure login & profile management  

### Tech Stack

- **Framework**: React Native (Expo)  
- **Routing**: `expo-router`  
- **UI**: `react-native-paper`, `react-native-vector-icons`  
- **State**: React Hooks & Context API  

---

## Getting Started

### 📱 Frontend – React Native

```bash
# Install dependencies
npm install

# Start development server
npx expo start
```

### Backend – Azure Functions (Python)
```bash
# Setup virtual environment
python3.10 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run locally
func start
```
### Deploy to Azure
```bash
func azure functionapp publish smart-gardening-functions --python --verbose
```

### AI Integration – Powered by OpenAI

GrowMateAI uses ChatGPT for:

- Real-time sensor data analysis

- Personalized plant care advice

- Optimized garden layout suggestions

- Plant disease and stress diagnosis

Making expert gardening advice accessible to everyone.

### ESP32-C3 Sensor System
### Hardware

- Soil Moisture Sensor

- DHT22 (Temperature & Humidity)

- Light Intensity Sensor

### Connectivity

- Sends data via HTTP to Azure Functions

- Optional MQTT support for real-time streaming

- Battery-efficient for continuous deployment


