/* eslint-disable import/no-extraneous-dependencies */
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/userDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const adminSchema = new mongoose.Schema({

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
  shopName: {
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
  bankName: {
    require: true,
    type: String,
  },
  venderAccessEnabled: {
    require: true,
    type: Boolean,
  },
  accountNumber: {
    require: true,
    type: Number,
  },
  password: {
    require: true,
    type: String,
  },
  image: {
    require: true,
    type: String,
  },
}, { timestamps: true, timeseries: true });
const userSchema = new mongoose.Schema({
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
  phone: {
    require: true,
    type: String,
  },
  role: {
    require: true,
    type: String,
  },
  licenseNumber: {
    require: true,
    type: String,
    unique: true,
  },
  password: {
    require: true,
    type: String,
  },
  address: [{
    place: {
      type: String,
      require: false,
    },
    zip: {
      type: Number,
      require: false,
    },
    houseName: {
      type: String,
      require: false,
    },
  },
  ],
}, { timestamps: true, timeseries: true });

const Vender = mongoose.model('vender', VenderSchema, 'users');
const admin = mongoose.model('User', adminSchema);
const User = mongoose.model('dealers', userSchema, 'users');

module.exports = { admin, Vender, User };
