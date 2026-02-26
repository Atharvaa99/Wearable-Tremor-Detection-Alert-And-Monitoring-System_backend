const express = require('express');
const deviceController = require('../controllers/device.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.post("/connect-device/:deviceId/:type",authMiddleware.authDevice, deviceController.createDevice);
router.delete("/delete-device/:deviceId",authMiddleware.authUser, deviceController.deleteDevice);

module.exports = router;