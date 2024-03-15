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
    venderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'vendor',
    },
    notificationsId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    message: String,
    sender: String,
    createdAt: { type: Date, default: Date.now },
  }],
  locations: [{
    type: String,
  }],
  service: [
    {
      ServiceName: { type: String },
      charge: { type: Number },
      image: { type: String },
      imageId: { type: String },
      description: { type: String },
    },
  ],
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
  notifications: [{
    message: String,
    sender: String,
    createdAt: { type: Date, default: Date.now },
  }],
  locations: [{
    type: String,
  }],
  service: [
    {
      ServiceName: { type: String },
      charge: { type: Number },
      image: { type: String },
      imageId: { type: String },
      description: { type: String },
    },
  ],
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
  bookedCar: [{
    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Car',
    },
    bookingDate: {
      type: Date,
      required: true,
    },
    pickupDate: {
      type: Date,
      required: true,
    },
    pickUp: {
      type: Boolean,
      default: false,
    },
    carStatus: {
      type: String,
      enum: ['PickedDate', 'ReturnDate', 'Booked', 'pickedCar', 'returnCar'],
      default: 'Booked',
    },
    return: {
      type: Boolean,
      default: false,
    },
    payment_id: {
      type: String,
    },
    paymentMethod: {
      type: String,
    },
    returnDate: {
      type: Date,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    totalDays: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'Confirmed', 'cancelled'],
      default: 'pending',
    },
    carRent: {
      type: Number,
    },
    services: [{
      type: mongoose.Schema.Types.ObjectId,
    }],
    // Other booking details specific to your application
  }],
}, { timestamps: true, timeseries: true });

const Vendor = mongoose.model('vendor', VendorSchema, 'users');
const admin = mongoose.model('User', adminSchema);
const User = mongoose.model('dealers', userSchema, 'users');

module.exports = { admin, Vendor, User };
