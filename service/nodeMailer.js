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
  console.error(otp, email);
  return new Promise((resolve, reject) => {
    const mailOption = {
      from: 'fahizk100@gmail.com',
      to: email,
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
function sendMailToAdmin(email, message, subjects, callback) {
  const mailOption = {
    from: email,
    to: 'drivewave299@gmail.com',
    subject: subjects,
    html: `<p style="font-family: Arial; sans-serif; font-size: 16px;">${message}</p>`,
  };
  transporter.sendMail(mailOption, callback);
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

function sendMailUser(email, subject, data, booking, car, service) {
  return new Promise((resolve, reject) => {
    // Read the Handlebars template file

    const emailContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Invoice</title>
    <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            padding-top: 20px;
        }

        .container {
            background-color: #fff;
            border-radius: 5px;
            box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.1);
            padding: 20px;
        }

        .invoice-header {
          background-color: #f0f0f0;
          padding: 15px;
          border-radius: 5px 5px 0 0;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
      }

        .invoice-header h2 {
            margin: 0;
            color: #333;
        }

        .invoice-details {
            margin-bottom: 30px;
        }

        .invoice-details address {
            font-style: normal;
            color: #666;
        }

        .table {
            margin-bottom: 0;
        }

        .table th, .table td {
            border-top: none;
            border-bottom: 1px solid #ddd;
            vertical-align: middle;
        }

        .table th {
            background-color: #f9f9f9;
            font-weight: normal;
            color: #666;
            border-bottom: 2px solid #ddd;
        }

        .table tfoot th {
            background-color: #f0f0f0;
            border-top: 2px solid #ddd;
        }

        .text-right {
            text-align: right;
        }

        .invoice-footer {
            background-color: #f0f0f0;
            padding: 15px;
            border-radius: 0 0 5px 5px;
            margin-top: 20px;
        }

        .invoice-footer p {
            margin-bottom: 0;
            color: #666;
        }

        @media screen and (max-width: 768px) {
            .invoice-details {
                margin-bottom: 10px;
            }

            .table-responsive {
                overflow-x: auto;
            }
        }
    </style>
</head>
<body>
    <div class="container">
    <div class="invoice-header">
    <div>
        <h2>Drive Wave</h2>
    </div>
    <div>
        <h2 class="text-center">Invoice</h2>
    </div>
</div>
        <div class="row invoice-details">
            <div class="col-sm-6">
                <h5>From:</h5>
                <address>
                    Drive Wave<br>
                    123 Street Name<br>
                    City, State, Zip<br>
                    Country<br>
                    Email: Fahizk100@gmail.com<br>
                    Phone: +123-456-7890
                </address>
            </div>
            
        </div>
        <div class="row">
            <div class="col-sm-12">
                <div class="table-responsive">
                    <table class="table col-12">
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th>Car Modal</th>
                                <th>Price</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>${car.carName}</td>
                                <td>${car.carModal}</td>
                                <td>${car.dayRent}</td>
                                <td>${car.dayRent}</td>
                            </tr>
                            ${service.map((item) => `
                                <tr>
                                    <td>${item.ServiceName}</td>
                                    <td>1</td>
                                    <td>${item.charge}</td>
                                    <td>${item.charge}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="3" class="text-right"><strong>Total:</strong></td>
                                <td><strong>${booking.totalPrice}</strong></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
        <div class="row p-3 m-3">
            <div class="col-sm-6">
                <h5>Order Details:</h5>
                <p>Order ID: ${booking.payment_id}</p>
                <p>Date: January 1, 2024</p>
            </div>
            <div class="col-sm-6 text-right">
                <h5>Payment Method:</h5>
                <p>${booking.paymentMethod}</p>
                <p>Card Ending: xxxx</p>
            </div>
        </div>
        <div class="invoice-footer">
        <p>Thank you for shopping with us. We appreciate your business and hope you enjoy your purchase!</p>
        <p>Best regards,<br>
        Admin<br>
        Drive Wave</p>

        </div>
    </div>
</body>
</html>
 `;
    // Compile the Handlebars template

    // Render the template with data (if needed)

    const mailOption = {
      from: 'fahizk100@gmail.com',
      to: email,
      subject,
      html: emailContent, // Use rendered HTML template
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
  });
}
module.exports = {
  generateOtp,
  sendAdminOtp,
  sendMailToAdmin,
  sendmailVendor,
  sendMailUser,
};
