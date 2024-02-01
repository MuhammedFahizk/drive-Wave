/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-undef */
const mongoose = require('mongoose');

try {
  const VenderSchema = new mongoose.Schema({
    name: {
      require: true,
      type: String,
    },
    age: {
      require: true,
      type: Number,
    },
    email: {
      require: true,
      type: String,
    },
    shopeName: {
      require: true,
      type: String,
    },
    phone: {
      require: true,
      type: Number,
    },
    role: {
      require: true,
      type: String,
    },
    joinDate: {
      require: true,
      type: Date,
    },
    bankName: {
      require: true,
      type: String,
    },
    accountNumber: {
      require: true,
      type: Number,
    },
    image: {
      require: true,
      type: String,
    },
  }, { timeseries: true });
  const vender = mongoose.model('vender', VenderSchema);
  module.exports = vender;
} catch {
  console.error('Error during vender db:');
//   res.status(500).send('Internal Server Error');
}
