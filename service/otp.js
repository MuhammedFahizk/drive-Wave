/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-sequences */
/* eslint-disable comma-spacing */
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: 'benny.grimes6@ethereal.email',
    pass: 'beCWcw3HXWCzGp4zAx',
  },
});

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function sendAdminOtp(email, otp, callback) {
  const mailOption = {
    from: 'fahizk100@gmal.com',
    to: email,
    subject: 'your OTP for Login',
    text: `your Otp is :${otp}`,
  };
  // eslint-disable-next-line no-unused-expressions
  transporter.sendMail(mailOption,callback);
}

module.exports = { generateOtp ,sendAdminOtp };
