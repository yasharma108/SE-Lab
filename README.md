<<<<<<< HEAD
# SE-Lab
This repo is for the SE lab Project - FieldSense
Here Our SE project Fieldsense is uploaded
=======
# FieldSense (IoT Cold Chain Monitor)

FieldSense is a real-time IoT monitoring system designed for cold chain management. It monitors refrigerator temperatures using ESP32 sensors and automatically generates maintenance tickets if temperatures breach safe thresholds.

## 🚀 System Features
- **Real-time Monitoring:** Live telemetry via WebSockets.
- **Auto-Fault Detection:** Instant alert and ticket generation when thresholds are exceeded.
- **Role-Based Access:** Dedicated interfaces for Admins, Managers, and Technicians.
- **IoT Integration:** Direct MQTT/HTTP support for ESP32 with DHT11/22 sensors.

## 🛠️ Technology Stack
- **Frontend:** React.js, Vite, Material UI, Recharts.
- **Backend:** Node.js, Express, WebSockets (`ws`).
- **Database:** MySQL.
- **Hardware:** ESP32 (Arduino C++).

## 📂 Project Structure
- `/backend`: Node.js server, API routes, and WebSocket logic.
- `/frontend`: React dashboard and management UI.
- `/database`: MySQL schema and seed data.
- `temp_alert.ino`: ESP32 firmware code.

## 🚦 Getting Started
1. **Database:** Import `database/schema.sql` into MySQL.
2. **Backend:** Run `npm install` and `node server.js` in `/backend`.
3. **Frontend:** Run `npm install` and `npm run dev` in `/frontend`.
4. **Hardware:** Flash `temp_alert.ino` to your ESP32 with the correct WiFi credentials and PC IP address.

## 🛡️ User Roles
- **Admin:** System configuration and top-level monitoring.
- **Manager:** Asset management and technician assignment.
- **Technician:** Fault resolution and note tracking.
>>>>>>> c145d371 (Added final code)
