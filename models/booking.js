const mongoose = require('mongoose');

const { User } = require('./users');
const { Car } = require('./car');

try {
  const bookingSchema = new mongoose.Schema({
    user: {
      type: mongoose.Types.ObjectId,
      ref: User,
    },
    cars: {
      type: mongoose.Types.ObjectId,
      ref: Car,
    },
    totalRent: {
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
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending',
    },
  });
  const Booking = mongoose.model('booking', bookingSchema);

  module.exports = { Booking };
} catch {
  console.error('Internal Server Error');
}
