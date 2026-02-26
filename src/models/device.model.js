const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
    deviceId:{
        type: String,
        required: [true, "Device Id must be associated with to add a new Device"],
        unique: [true, "Device Id must be unique"]
    },
    status:{
        type: String,
        enum: {
            values: ["ACTIVE","INACTIVE"],
            message: "Device can have either ACTIVE or INACTIVE status"
        },
        required: [true, "Device must have an status associated with it." ],
        default: "INACTIVE"
    },
    patientName:{
        type: String,
        default: "Jhon Doe"
    },
    type:{
        type: String,
        required: [true, "Device must have an type associated with it"]
    }
}, {timestamps: true})

const deviceModel = mongoose.model('device',deviceSchema);


module.exports = deviceModel;