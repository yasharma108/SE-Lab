const express = require('express');
const router = express.Router();
const issuesController = require('../controllers/issuesController');
const { authMiddleware, authorizeRoles } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', issuesController.getAllIssues);
router.get('/:id', issuesController.getIssueById);
router.post('/', authorizeRoles('admin', 'manager', 'staff'), issuesController.createIssue);
router.put('/:id/assign', authorizeRoles('admin', 'manager'), issuesController.assignTechnician);
router.put('/:id/status', authorizeRoles('admin', 'manager', 'technician'), issuesController.updateStatus);
router.put('/:id/close', authorizeRoles('admin', 'manager', 'technician'), issuesController.closeIssue);

module.exports = router;
