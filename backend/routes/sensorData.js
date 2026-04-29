/**
 * routes/sensorData.js
 * Open endpoint — no JWT required.
 * ESP32 posts here: POST /api/sensor-data
 */

const express = require('express');
const router  = express.Router();
const sensorDataController = require('../controllers/sensorDataController');

router.post('/', sensorDataController.ingest);

module.exports = router;
