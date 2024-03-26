/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-sequences */
/* eslint-disable comma-spacing */
const handlebars = require('handlebars');
const fs = require('fs');
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

function sendAdminOtp(email, otp) {
  return new Promise((resolve, reject) => {
    const mailOption = {
      from: 'fahizk100@gmail.com',
      to: 'fahizk100@gmail.com',
      subject: 'Your OTP for Login',
      text: `Your OTP is: ${otp}`,
    };
    transporter.sendMail(mailOption, (error, info) => {
      if (error) {
        reject(error); // Reject with error if email sending fails
      } else {
        resolve(info); // Resolve with info if email sending is successful
      }
    });
  });
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
function sendmailVendor(email, message, subjects, callback) {
  const mailOption = {
    from: 'fahizk100@gmail.com',
    to: email,
    subject: subjects,
    html: `<p style="font-family: Arial; sans-serif; font-size: 16px;">${message}</p>`,

  };
  transporter.sendMail(mailOption, callback);
}

function sendMailUser(email, subject,data) {
  return new Promise((resolve, reject) => {
    // Read the Handlebars template file
    fs.readFile('views/ConfirmationEmail.hbs', 'utf8', (error, templateSource) => {
      if (error) {
        console.error('Error reading email template:', error);
        reject(error);
      } else {
        // Compile the Handlebars template
        const template = handlebars.compile(templateSource);

        // Render the template with data (if needed)
        const html = template(data);

        const mailOption = {
          from: 'fahizk100@gmail.com',
          to: email,
          subject,
          html, // Use rendered HTML template
        };

        // Send the email
        transporter.sendMail(mailOption, (errors, info) => {
          if (errors) {
            console.error('Error sending email:', errors);
            reject(errors);
          } else {
            resolve(info);
          }
        });
      }
    });
  });
}
module.exports = {
  generateOtp,
  sendAdminOtp,
  sendMailToAdmin,
  sendmailVendor,
  sendMailUser,
};
