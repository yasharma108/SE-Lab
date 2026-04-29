const express = require('express');
const router = express.Router();
const techniciansController = require('../controllers/techniciansController');
const { authMiddleware, authorizeRoles } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', authorizeRoles('admin', 'manager'), techniciansController.getAllTechnicians);
router.post('/', authorizeRoles('admin'), techniciansController.createTechnician);

module.exports = router;
