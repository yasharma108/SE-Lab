/**
 * controllers/sensorDataController.js
 *
 * Handles ESP32 POST /api/sensor-data
 * 1. Stores reading in sensor_logs
 * 2. Checks threshold vs assets.min/max_temp_celsius
 * 3. Auto-creates issue + alert record on breach
 * 4. Broadcasts SENSOR_UPDATE to all WebSocket clients
 */

const db      = require('../config/db');
const wsHub   = require('../websocket');

exports.ingest = async (req, res) => {
    try {
        const { assetId, temperature, powerStatus = 'ON' } = req.body;

        if (!assetId || temperature === undefined || temperature === null) {
            return res.status(400).json({ message: 'assetId and temperature are required' });
        }

        const tempNum = parseFloat(temperature);
        if (isNaN(tempNum)) {
            return res.status(400).json({ message: 'temperature must be a number' });
        }

        // 1 ── Store sensor reading
        await db.query(
            'INSERT INTO sensor_logs (asset_id, temperature, power_status) VALUES (?, ?, ?)',
            [assetId, tempNum, powerStatus]
        );

        // 2 ── Fetch asset thresholds
        const [assets] = await db.query(
            `SELECT asset_id, product_name, company_name, location,
                    min_temp_celsius, max_temp_celsius
             FROM assets WHERE asset_id = ?`,
            [assetId]
        );

        let alertGenerated = false;
        let alertMessage   = null;
        let broadcastPayload;

        if (assets.length > 0) {
            const asset  = assets[0];
            const maxT   = parseFloat(asset.max_temp_celsius);
            const minT   = parseFloat(asset.min_temp_celsius);

            let isAnomaly      = false;
            let issueDesc      = '';
            let priorityLevel  = 'high';

            // Temperature threshold check
            if (!isNaN(maxT) && tempNum > maxT) {
                isAnomaly  = true;
                priorityLevel = 'critical';
                issueDesc += `ALERT: Temperature ${tempNum}°C exceeded max threshold ${maxT}°C for ${assetId}. `;
            } else if (!isNaN(minT) && tempNum < minT) {
                isAnomaly = true;
                issueDesc += `ALERT: Temperature ${tempNum}°C is below min threshold ${minT}°C for ${assetId}. `;
            }

            // Power failure check
            if (['power_loss', 'offline'].includes(powerStatus)) {
                isAnomaly     = true;
                priorityLevel = 'critical';
                issueDesc    += `CRITICAL: Power status is "${powerStatus}". `;
            }

            if (isAnomaly) {
                alertGenerated = true;
                alertMessage   = issueDesc.trim();

                // Auto-create issue for manager
                await db.query(
                    `INSERT INTO issues
                        (asset_id, issue_type, description, priority, status)
                     VALUES (?, ?, ?, ?, ?)`,
                    [assetId, 'IoT Sensor Alert', alertMessage, priorityLevel, 'open']
                );

                // Store alert record
                await db.query(
                    `INSERT INTO alerts
                        (asset_id, temperature, threshold_max, threshold_min, message)
                     VALUES (?, ?, ?, ?, ?)`,
                    [assetId, tempNum, maxT || null, minT || null, alertMessage]
                );
            }

            broadcastPayload = {
                asset_id        : assetId,
                product_name    : asset.product_name,
                company_name    : asset.company_name,
                location        : asset.location,
                temperature     : tempNum,
                power_status    : powerStatus,
                min_temp_celsius: asset.min_temp_celsius,
                max_temp_celsius: asset.max_temp_celsius,
                last_update     : new Date().toISOString(),
                alertGenerated,
                alertMessage,
            };
        } else {
            // Asset not in DB — still log & broadcast raw data
            broadcastPayload = {
                asset_id    : assetId,
                temperature : tempNum,
                power_status: powerStatus,
                last_update : new Date().toISOString(),
                alertGenerated: false,
                alertMessage  : null,
            };
        }

        // 3 ── Broadcast via WebSocket to all connected browsers
        wsHub.broadcast({ type: 'SENSOR_UPDATE', payload: broadcastPayload });

        return res.status(201).json({ message: 'Sensor data recorded', alertGenerated, alertMessage });

    } catch (err) {
        console.error('[sensorData] ingest error:', err.message);
        return res.status(500).json({ message: 'Server error' });
    }
};
