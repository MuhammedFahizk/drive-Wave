const mongoose = require('mongoose');

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
    unique: true,
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
  isBlocked: {
    type: Boolean,
    default: false,
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
      enum: ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Overdue', 'Not Picked', 'Cancel'],
      default: 'Pending',
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

const User = mongoose.model('dealers', userSchema);

module.exports = { User };
