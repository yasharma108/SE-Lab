const express = require('express');
const router = express.Router();
const assetsController = require('../controllers/assetsController');
const { authMiddleware, authorizeRoles } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', assetsController.getAllAssets);
router.get('/:id', assetsController.getAssetById);
router.post('/', authorizeRoles('admin'), assetsController.createAsset);
router.put('/:id', authorizeRoles('admin'), assetsController.updateAsset);
router.delete('/:id', authorizeRoles('admin'), assetsController.deleteAsset);

module.exports = router;
