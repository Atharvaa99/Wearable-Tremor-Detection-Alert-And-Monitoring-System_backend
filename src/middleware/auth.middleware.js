const tokenBlacklistModel = require('../models/blacklist.model');
const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');

async function authUser(req, res, next) {

    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({
            message: 'Unauthorized'
        })
    }
    const token = header.split(' ')[1];

    const isBlacklisted = await tokenBlacklistModel.findOne({ token:token });

    if (isBlacklisted) {
        return res.status(401).json({
            message: "Unauthorized token is blacklisted"
        })
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userModel.findOne({ _id: decoded.id });

        req.user = user

        return next();

    } catch (err) {
        console.log('Failed to verify token: ', err);
        return res.status(401).json({
            message: 'Unauthorized access invalid token'
        })
    }
}

async function authAdmin(req, res, next) {

        const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({
            message: 'Unauthorized'
        })
    }
    const token = header.split(' ')[1];

    const isBlacklisted = await tokenBlacklistModel.findOne({ token:token });

    if (isBlacklisted) {
        return res.status(401).json({
            message: "Unauthorized token is blacklisted"
        })
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userModel.findOne({ _id: decoded.id });

        if(user.role !== "Admin"){
            return res.status(403).json({
                message: "Forbiden access not allowed"
            })
        }

        req.user = user

        return next();

    } catch (err) {
        console.log('Failed to verify token: ', err);
        return res.status(401).json({
            message: 'Unauthorized access invalid token'
        })
    }
}

async function authDevice(req,res,next){
    const apiKey = req.headers['x-api-key'];

    if(!apiKey || apiKey !== process.env.DEVICE_API_KEY){
        return res.status(401).json({
            message: "Unauthorized"
        });
    }
    return next();
}

module.exports = { authUser, authAdmin,authDevice };