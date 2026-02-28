const deviceModel = require('../models/device.model');

async function createDevice(req,res){

    const deviceId = req.params.deviceId;
    const type = req.params.type;

    const isDeviceExists = await deviceModel.findOne({
        deviceId
    })

    if(isDeviceExists){
        return res.status(200).json({
            message: "Device already exists"
        })
    }

    const device = await deviceModel.create({
        deviceId,
        type
    })

    res.status(201).json({
        message: "Device Added successfully",
        device
    })
}

async function deleteDevice(req,res){

    const deviceId = req.params.deviceId;
    await deviceModel.findOneAndDelete({
        deviceId:deviceId
    })

    res.status(200).json({
        message: `Device with Id: ${deviceId} has been removed`
    })
}
async function viewAll(req, res) {
    try {
        const devices = await deviceModel.find();
        res.status(200).json({ devices });
    } catch (err) {
        console.log(err);
        return res.status(400).json({ message: "Database error" });
    }
}

module.exports = { createDevice,deleteDevice,viewAll }