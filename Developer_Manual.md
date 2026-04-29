# FieldSense Developer Manual

## 1. Architecture Overview
FieldSense uses a **Client-Server-Database** architecture with a side-channel for **WebSockets**.

### Data Flow
`ESP32 → HTTP POST → Express API → MySQL → WebSocket Broadcast → React UI`

## 2. Backend Logic (Controllers)
*   `sensorDataController.js`: This is the most critical file. It handles incoming sensor data, checks it against database thresholds, and broadcasts the result.
*   `websocket.js`: A singleton module that handles broadcasting to all connected frontend clients.

## 3. Database Schema
*   `assets`: Stores metadata and thresholds (`max_temp`, `min_temp`).
*   `sensor_logs`: Historical record of every reading.
*   `issues`: The "Tickets" table that tracks fault status from "Open" to "Closed".

## 4. Hardware Integration
The ESP32 uses the `HTTPClient` library to send JSON payloads. 
**Important:** The field names in the JSON (`assetId`, `temperature`, `powerStatus`) must exactly match the keys expected in `sensorDataController.js`.

## 5. Security
Authentication is handled via **JWT (JSON Web Tokens)**. Roles are verified using the `authorizeRoles` middleware in the Express routes.

## 6. Extending the System
To add a new sensor type (e.g., Humidity):
1. Add a `humidity` column to the `sensor_logs` table.
2. Update the `ingest` function in `sensorDataController.js` to parse humidity.
3. Update the `Live.jsx` frontend to display the new gauge.
