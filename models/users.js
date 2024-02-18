/* eslint-disable import/no-extraneous-dependencies */
const mongoose = require('mongoose');
// eslint-disable-next-line no-unused-vars
const { Car } = require('./car');

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
  role: {
    require: true,
    type: String,
  },
  notifications: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'dealers',
    },
    message: String,
    sender: String,
    createdAt: { type: Date, default: Date.now },
  }],
});
const VendorSchema = new mongoose.Schema({
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
  vendorAccessEnabled: {
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
  deletedAt: {
    require: false,
    type: Date,
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
  deletedAt: {
    require: false,
    type: Date,
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
  whishList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Car',
    },
  ],
  bookedCar: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
    },
  ],
}, { timestamps: true, timeseries: true });

const Vendor = mongoose.model('vendor', VendorSchema, 'users');
const admin = mongoose.model('User', adminSchema);
const User = mongoose.model('dealers', userSchema, 'users');

module.exports = { admin, Vendor, User };
