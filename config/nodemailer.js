const { BrevoClient } = require('@getbrevo/brevo');

const client = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY
});

const sendOTP = async (toEmail, otpCode) => {
    await client.transactionalEmails.sendTransacEmail({
        sender: { name: 'Munus', email: 'munuscareer@gmail.com' },
        to: [{ email: toEmail }],
        subject: 'Your OTP for Munus',
        textContent: `Your OTP is: ${otpCode}. Valid for 5 minutes.`
    });
};

module.exports = sendOTP;