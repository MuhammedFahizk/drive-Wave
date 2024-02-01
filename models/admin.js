/* eslint-disable import/no-extraneous-dependencies */
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/userDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({

  email: {
    type: String,
    unique: true,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
});
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
const Vender = mongoose.model('vender', VenderSchema, 'users');
const admin = mongoose.model('User', userSchema);

module.exports = { admin, Vender };
