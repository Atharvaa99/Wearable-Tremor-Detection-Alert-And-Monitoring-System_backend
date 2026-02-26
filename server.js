require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');
const seedAdmin = require('./src/seeds/admin.seed');
const startDeviceMonitor = require('./src/jobs/deviceMonitor.job');

const PORT = 3000;

connectDB().then(() => {
    try{
        seedAdmin();
        startDeviceMonitor();
        app.listen(PORT,() =>{
            console.log(`Server started at PORT ${PORT}`);
        })
    }catch(err){
        console.log(err);
    }
})

