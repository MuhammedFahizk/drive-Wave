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

const User = mongoose.model('dealers', userSchema);

module.exports = { User };
