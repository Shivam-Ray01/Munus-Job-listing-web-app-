const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: '74.125.133.109', 
    port: 465,
    secure: true,
    family: 4,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS
    }
});

module.exports = transporter;