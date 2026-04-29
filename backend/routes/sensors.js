const express = require('express');
const router  = express.Router();
const sensorsController = require('../controllers/sensorsController');

// All these require auth (applied at server.js router level via /api/v1/sensors)
router.get('/live',              sensorsController.getLiveData);
router.get('/history/:assetId',  sensorsController.getHistory);
router.get('/alerts',            sensorsController.getAlerts);

module.exports = router;
