const mongoose = require('mongoose');

const { User } = require('./users');
const { Car } = require('./car');

try {
  const bookingSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Types.ObjectId,
      ref: User,
    },
    carId: {
      type: mongoose.Types.ObjectId,
      ref: Car,
    },
    price: {
      type: Number,
      require: true,
    },
    pickDate: {
      type: Date,
      require: true,
    },
    dropDate: {
      type: Date,
      require: true,
    },
    email: {
      type: String,
      require: true,
    },
    holderName: {
      type: String,
      require: true,
    },
    cardNumber: {
      type: String,
      require: true,
    },
    expire: {
      type: String,
      require: true,
    },
    cvv: {
      type: String,
      require: true,
    },
    address: {
      houseName: {
        type: String,
        require: true,
      },
      place: {
        type: String,
        require: true,
      },
      zip: {
        type: Number,
        require: true,
      },
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
    },
  });
  const Booking = mongoose.model('Booking', bookingSchema);

  module.exports = { Booking };
} catch {
  console.error('Internal Server Error');
}
