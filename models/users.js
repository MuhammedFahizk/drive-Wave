/* eslint-disable import/no-extraneous-dependencies */
const mongoose = require('mongoose');

const ownerSchema = new mongoose.Schema({
  // Common Fields
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: false,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: Number,
    required: false,
  },
  role: {
    type: String,
    required: true,
    enum: ['Vendor', 'Admin'],
  },
  password: {
    type: String,
    required: true,
  },
  // Vendor-specific Fields
  shopName: String,
  bankName: String,
  vendorAccessEnabled: Boolean,
  accountNumber: Number,
  image: String,
  // Admin-specific Fields
  notifications: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    notificationId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    message: String,
    sender: String,
    createdAt: { type: Date, default: Date.now },
  }],
  banner: [{
    bannerName: String,
    bannerImage: String,
    imageId: String,
    heading: String,
    subHeading: String,
  }],
  // Common Fields Continued
  deletedAt: {
    type: Date,
    default: null,
  },
  // Address Information
  locations: [String],
  // Service Details
  service: [{
    serviceName: String,
    charge: Number,
    image: String,
    imageId: String,
    description: String,
  }],
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
  address: {
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

// const Vendor = mongoose.model('Vendor', VendorSchema);
const admin = mongoose.model('Owners', ownerSchema, 'Owners');
const User = mongoose.model('dealers', userSchema);

module.exports = { admin, User };
