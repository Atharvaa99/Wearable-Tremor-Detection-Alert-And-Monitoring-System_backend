const patientModel = require('../models/patient.model');
const deviceModel = require('../models/device.model');

async function createPatient(req, res) {
    const { name, deviceId } = req.body;
    try {
        const device = await deviceModel.findOne({ deviceId });

        if (!device) {
            return res.status(404).json({
                message: "Device not found. Make sure the device is connected first."
            });
        }

        if (device.status === 'ACTIVE') {
            return res.status(400).json({
                message: "Device is already assigned to a patient."
            });
        }

        const patient = await patientModel.create({ name, deviceId });

        device.status = "ACTIVE";
        device.patientName = name;
        await device.save();

        res.status(201).json({
            message: "Patient added successfully",
            patient,
            device
        });
    } catch (err) {
        console.log(err);
        return res.status(400).json({ message: "Database error" });
    }
}
async function updatePatientInfo(req, res) {

    const deviceId = req.params.deviceId;

    const { HR, SPO2, tremorStatus } = req.body;
    try {
        const patient = await patientModel.findOne({
            deviceId
        })
        if (!patient) {
            return res.status(404).json({
                message: "Patient not found"
            })
        }

        const device = await deviceModel.findOne({ deviceId });
        if (device && device.status === "INACTIVE") {
            device.status = "ACTIVE";
            await device.save();
        }

        patient.HR = HR;
        patient.SPO2 = SPO2;
        patient.tremorStatus = tremorStatus;
        patient.lastSeen = Date.now();
        await patient.save();

        res.status(200).json({
            message: "Patient info updated successfully",
            patient
        })
    } catch (err) {
        console.log(err);
        return res.status(400).json({
            message: "Database error"
        })
    }

}

async function deletePatient(req, res) {
    const patientId = req.params.patientId;
    try {
        const patient = await patientModel.findOne({ _id: patientId });

        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }

        const deviceId = patient.deviceId;
        const device = await deviceModel.findOne({ deviceId });

        if (device) {
            device.status = "INACTIVE";
            device.patientName = "Jhon Doe";
            await device.save();
        }

        await patientModel.findOneAndDelete({ _id: patientId });

        res.status(200).json({ message: "Patient Deleted successfully" });
    } catch (err) {
        console.log(err);
        return res.status(400).json({ message: "Database error" });
    }
}

async function viewAll(req, res) {
try{
    const users = await patientModel.find();

    res.status(200).json({
        message: "All patients are as follows",
        users
    })
}catch(err){
    console.log(err);
    return res.status(400).json({
        message: "Database error"
    })
}
}

module.exports = { createPatient, updatePatientInfo, deletePatient, viewAll }