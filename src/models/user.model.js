const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        trim: true,
        unique: true,
        required: [true, "Name must be associated with user to exists"]
    },
    password:{
        type: String,
        minlength: [6, "password must be atleast 6 characters long"],
        required: [true, "password is required for creating an user"],
        select: false
    },
    role:{
        type: String,
        enum:{
            values: ["Admin", "User"],
            message: "The role can either be User or Admin"
        },
        default: "User",
        required: [true, "A role must be associated with an user"]
    }
},{timestamps: true})

/**
 * Hook for Password hashing on updation of Password
 */
userSchema.pre('save', async function() {
    
    if(!this.isModified('password')){
        return;
    }

    const hash = await bcrypt.hash(this.password,10);

    this.password = hash;

    return;
})


/**
 * An method for comparing password
 * @param {string} password - Plain text password entered by user 
 * @returns {Promise<boolean>}
 */
userSchema.methods.comparePassword = async function(password){
    
    return await bcrypt.compare(password,this.password);
}


const userModel = mongoose.model('user',userSchema);

module.exports = userModel;