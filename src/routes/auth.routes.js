const express = require('express');
const authController =require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

router.post( '/register-user',authMiddleware.authAdmin, authController.registerUser );
router.delete( '/delete-user/:userId',authMiddleware.authAdmin, authController.deleteUser );
router.get( '/viewAll',authMiddleware.authAdmin, authController.viewAll );
router.post( '/login',authController.loginUser );
router.post( '/logOut', authMiddleware.authUser,authController.logOut );


module.exports = router;