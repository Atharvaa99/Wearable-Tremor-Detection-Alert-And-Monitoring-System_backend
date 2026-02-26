const express = require('express');
const authRoute = require('./routes/auth.routes');
const deviceRoute = require('./routes/device.routes');
const patientRoute = require('./routes/patient.route');

const app = express();

app.use(express.json());
app.use('/api/auth', authRoute);
app.use('/api/device', deviceRoute);
app.use('/api/patient', patientRoute);


module.exports = app;