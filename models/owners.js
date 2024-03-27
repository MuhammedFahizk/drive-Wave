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

const admin = mongoose.model('Owners', ownerSchema);

module.exports = { admin };
