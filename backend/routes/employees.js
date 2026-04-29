const express = require('express');
const router = express.Router();
const employeesController = require('../controllers/employeesController');
const { authMiddleware, authorizeRoles } = require('../middleware/auth');

router.get('/', authMiddleware, authorizeRoles('admin', 'manager'), employeesController.getEmployees);

module.exports = router;
