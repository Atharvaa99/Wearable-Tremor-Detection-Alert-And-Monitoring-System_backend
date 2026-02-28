const tokenBlacklistModel = require('../models/blacklist.model');
const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');

async function registerUser(req, res) {

    const { name, password, role = "user" } = req.body;

    const isUserAlreadyExists = await userModel.findOne({
        name
    })

    if (isUserAlreadyExists) {
        return res.status(401).json({
            message: "User already Exists with this name"
        })
    }

    const user = await userModel.create({
        name,
        password,
        role: "User"
    })

    res.status(201).json({
        message: "User created Succesfully",
        user
    })
}

async function deleteUser(req, res) {

    const userId = req.params.userId;

    await userModel.findByIdAndDelete(userId);

    res.status(200).json({
        message: ` User with id: ${userId} deleted`,
        userId
    })
}

async function loginUser(req, res) {

    const { name, password } = req.body;

    const user = await userModel.findOne({
        name
    }).select("+password");

    if (!user) {
        return res.status(404).json({
            message: "User not found"
        })
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
        return res.status(401).json({
            message: "Incorrect Password"
        })
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.status(200).json({
        message: "User logged in",
        token,
        user: { id: user._id, name: user.name, role: user.role }
    })
}

async function viewAll(req, res) {

    const users = await userModel.find();

    res.status(200).json({
        message: "All users are as follows",
        users
    })
}

async function logOut(req, res) {

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            message: "Invalid header"
        })
    }

    const token = authHeader.split(' ')[1];

    await tokenBlacklistModel.create({
        token
    })

    res.status(200).json({
        message: "User Logged Out"
    })
}



module.exports = { registerUser, loginUser, logOut, deleteUser, viewAll };