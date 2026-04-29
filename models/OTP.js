const { name } = require('ejs');
const mongoose = require('mongoose');

const otp = mongoose.Schema({
      email: String,
    code : String,
    username: String, 
    name: String,
    password: String,
    role: String,
      expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 5 * 60 * 1000)
    }

},{timestamps: true});

otp.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('otp' , otp);
