const express = require('express');
const cors = require('cors');
const authRoute = require('./routes/auth.routes');
const deviceRoute = require('./routes/device.routes');
const patientRoute = require('./routes/patient.route');

const app = express();

app.use(cors({
    origin: 'https://wearable-tremor-detector-frontend.vercel.app', 
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));

app.use(express.json());
app.use('/api/auth', authRoute);
app.use('/api/device', deviceRoute);
app.use('/api/patient', patientRoute);

module.exports = app