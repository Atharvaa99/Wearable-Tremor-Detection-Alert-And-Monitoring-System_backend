const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const patientController = require('../controllers/patient.controller');

const router = express.Router();

router.post('/create-patient',authMiddleware.authUser, patientController.createPatient);
router.patch('/patient-info/:deviceId', authMiddleware.authDevice, patientController.updatePatientInfo);
router.delete('/delete-patient/:patientId', authMiddleware.authUser, patientController.deltedPatient);
router.get('/viewAll', authMiddleware.authUser, patientController.viewAll);


module.exports = router;