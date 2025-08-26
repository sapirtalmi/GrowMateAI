# 🌿 GrowMateAI – AI-Powered Smart Gardening System

**GrowMateAI** is an end-to-end smart gardening solution that combines **IoT hardware**, **cloud-based serverless architecture**, and **AI-powered analytics** to help users monitor, diagnose, and optimize their home or commercial gardens.

This project leverages custom-built **ESP32-C3** sensors, a **React Native mobile app**, and a **Python backend hosted on Azure Functions** to deliver personalized, real-time plant care recommendations and automate garden management.

🔗 [Live Project Page](https://michaeljornist.github.io/GrowMatePage/)

---

## 🧠 Project Vision

Traditional gardening often relies on trial and error—figuring out when to water, what conditions plants thrive in, and how to detect problems early. GrowMateAI eliminates this guesswork by providing **data-driven**, **AI-enhanced**, and **sensor-powered** gardening assistance to users of all skill levels.

---

## 🧩 Architecture Overview

- **IoT Layer**: ESP32-based microcontrollers collect real-time data on temperature, soil moisture, humidity, and light.
- **Backend Layer**: Azure Functions process sensor data, manage users, and provide AI insights using OpenAI models.
- **Frontend Layer**: A mobile-first React Native app built with Expo delivers a smooth UX across iOS and Android.

---

## 📲 Mobile App – React Native with Expo

The GrowMateAI app serves as the central hub for users to interact with their garden:

### 🌐 Features

- Real-time sensor data visualization (temperature, moisture, etc.)
- AI-driven plant health diagnosis
- Smart garden planner for optimized layouts
- Community feed and post voting
- In-app and email notifications (e.g., watering reminders, hazards)
- Secure user login and profile management

### 🧱 App Stack

- **Framework**: React Native + Expo
- **Routing**: `expo-router`
- **UI Library**: `react-native-paper`, `react-native-vector-icons`

### 🛠️ Setup Instructions

```bash
npm install
npx expo start
