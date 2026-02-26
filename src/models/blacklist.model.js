const mongoose = require('mongoose');

const tokenBlacklistSchema = mongoose.Schema({
    token: {
        type: String,
        required: [true, "Token is required to Blacklist"],
        unique: [true, "Token is already Blacklisted"]
    },
    blacklistedAt: {
        type: Date,
        default: Date.now,
        immutable: true
    }
}, { timestamps: true })

tokenBlacklistSchema.index(
    { createdAt: 1 },
    { expiresAfterSeconds: 60 * 60 * 24 * 3 }
)

const tokenBlacklistModel = mongoose.model('tokenBlacklistModel', tokenBlacklistSchema);

module.exports = tokenBlacklistModel;