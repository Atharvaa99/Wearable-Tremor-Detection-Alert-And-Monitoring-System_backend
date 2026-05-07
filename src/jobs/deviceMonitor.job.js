const patientModel = require('../models/patient.model');
const deviceModel = require('../models/device.model');


async function checkInactiveDevice() {
    const thirtySecondsAgo = new Date(Date.now() - 30000);

    const inactivePatients = await patientModel.find({
        lastSeen: {$lt: thirtySecondsAgo}
    })

    for (const patient of inactivePatients){
        const device = await deviceModel.findOne({deviceId: patient.deviceId});

        if(device && device.status === "ACTIVE"){
            device.status = "INACTIVE"
            await device.save();
            patientModel.HR = 0;
            patientModel.SPO2 = 0;
            patientModel.tremorStatus = "INACTIVE";
            await patientModel.save();
        }
    }
}

function startDeviceMonitor(){
    setInterval(checkInactiveDevice, 10000);
}

module.exports = startDeviceMonitor;
