/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-sequences */
/* eslint-disable comma-spacing */
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'fahizk100@gmail.com',
    pass: 'kqhbhyjsefbolxht',
  },
});

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function sendAdminOtp(email, otp, callback) {
  const mailOption = {
    from: 'fahizk100@gmail.com',
    to: email,
    subject: 'your OTP for Login',
    text: `your Otp is :${otp}`,
  };
  // eslint-disable-next-line no-unused-expressions
  transporter.sendMail(mailOption,callback);
}
function sendMailToAdmin(email, message,subjects, callback) {
  const mailOption = {
    from: email,
    to: 'drivewave299@gmail.com',
    subject: subjects,
    html: `<p style="font-family: Arial; sans-serif; font-size: 16px;">${message}</p>`,
  };
  transporter.sendMail(mailOption,callback);
}
module.exports = { generateOtp ,sendAdminOtp, sendMailToAdmin };
