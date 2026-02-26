const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Patient must have a name"]
    },
    deviceId:{
        type: String,
        required: [true, "Patient must be associated with a device"],
        unique: [true, "No 2 patients can have same device"]
    },
    HR: {
        type: Number,
        default: 0,
        min: [0, "can't be negative"],
        required: [true, "Heart rate must be associated with patient"],
    },
    SPO2: {
        type: Number,
        default: 0,
        min: [0, "can't be negative"],
        required: [true, "Blood oxygen level must be associated with patient"],
    },
    tremorStatus:{
        type: String,
        enum:{
            values: ["ACTIVE","INACTIVE"],
            message: "Tremor status can be either ACTIVE or INACTIVE"
        },
        required: [true, "Tremor status must be associated with patient"],
        default: "INACTIVE"
    },
    lastSeen:{
        type: Date,
        default: Date.now,
    }
}, {timestamps: true})

const patientModel = mongoose.model('patient',patientSchema);

module.exports = patientModel;