const express = require('express');
const http    = require('http');
const cors    = require('cors');
const { WebSocketServer } = require('ws');
require('dotenv').config();

const wsHub = require('./websocket');

const app    = express();
const server = http.createServer(app);

// ── WebSocket server ──
const wss = new WebSocketServer({ server });
wsHub.init(wss);

wss.on('connection', (ws) => {
    console.log('[WS] Client connected. Total:', wss.clients.size);
    ws.on('close', () => console.log('[WS] Client disconnected. Total:', wss.clients.size));
});

app.use(cors());
app.use(express.json());

// ── Open route for ESP32 (no auth) ──
const sensorDataRoute = require('./routes/sensorData');
app.use('/api/sensor-data', sensorDataRoute);

// ── Authenticated API routes ──
const authRoutes       = require('./routes/auth');
const assetRoutes      = require('./routes/assets');
const issueRoutes      = require('./routes/issues');
const technicianRoutes = require('./routes/technicians');
const sensorRoutes     = require('./routes/sensors');
const dashboardRoutes  = require('./routes/dashboard');
const employeesRoutes  = require('./routes/employees');
const notesRoutes      = require('./routes/notes');

app.use('/api/v1/auth',        authRoutes);
app.use('/api/v1/assets',      assetRoutes);
app.use('/api/v1/issues',      issueRoutes);
app.use('/api/v1/technicians', technicianRoutes);
app.use('/api/v1/sensors',     sensorRoutes);
app.use('/api/v1/dashboard',   dashboardRoutes);
app.use('/api/v1/employees',   employeesRoutes);
app.use('/api/v1/notes',       notesRoutes);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`WebSocket ready on ws://localhost:${PORT}`);
});
