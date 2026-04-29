const db = require('../config/db');

/**
 * GET /api/v1/sensors/live
 * Returns the latest reading per asset (for Live page REST fallback)
 */
exports.getLiveData = async (req, res) => {
    try {
        const [data] = await db.query(`
            SELECT 
                a.asset_id, a.product_name, a.company_name, a.location,
                a.min_temp_celsius, a.max_temp_celsius,
                sl.temperature, sl.power_status, sl.timestamp AS last_update
            FROM assets a
            LEFT JOIN (
                SELECT asset_id, temperature, power_status, timestamp
                FROM sensor_logs sl1
                WHERE timestamp = (
                    SELECT MAX(timestamp) FROM sensor_logs sl2
                    WHERE sl1.asset_id = sl2.asset_id
                )
            ) sl ON a.asset_id = sl.asset_id
            ORDER BY a.created_at DESC
        `);
        res.json(data);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

/**
 * GET /api/v1/sensors/history/:assetId
 * Returns last 50 readings for a specific asset (for mini-chart)
 */
exports.getHistory = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT temperature, power_status, timestamp
             FROM sensor_logs
             WHERE asset_id = ?
             ORDER BY timestamp DESC
             LIMIT 50`,
            [req.params.assetId]
        );
        res.json(rows.reverse());
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

/**
 * GET /api/v1/sensors/alerts
 * Returns recent unacknowledged alerts
 */
exports.getAlerts = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT al.*, a.product_name, a.location
             FROM alerts al
             LEFT JOIN assets a ON al.asset_id = a.asset_id
             WHERE al.acknowledged = FALSE
             ORDER BY al.created_at DESC
             LIMIT 20`
        );
        res.json(rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
