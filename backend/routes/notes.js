const express = require('express');
const router = express.Router();
const notesController = require('../controllers/notesController');
const { authMiddleware, authorizeRoles } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/history', authorizeRoles('technician'), notesController.getHistory);
router.get('/', authorizeRoles('technician'), notesController.getNotes);
router.post('/', authorizeRoles('technician'), notesController.createNote);
router.put('/:id', authorizeRoles('technician'), notesController.updateNote);
router.delete('/:id', authorizeRoles('technician'), notesController.deleteNote);

module.exports = router;
