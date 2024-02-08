/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-undef */
const mongoose = require('mongoose');

try {
  const carSchema = new mongoose.Schema({
    carName: {
      type: String,
      require: true,
    },
    carCategory: {
      type: String,
      require: true,
    },
    year: {
      type: Number,
      require: true,
    },
    brand: {
      type: String,
      require: true,
    },
    dayRent: {
      type: Number,
      require: true,
    },
    brandName: {
      type: String,
      require: true,
    },
    carModal: {
      type: String,
      require: true,
    },
    licensePlateNumber: {
      type: String,
      require: true,
      unique: true,
    },
    carImage: {
      type: String,
      require: true,
    },
    color: {
      type: String,
      require: true,
    },
    fuelType: {
      type: String,
      require: true,
    },
    TransmitionType: {
      type: String,
      required: true,
    },
    milage: {
      type: Number,
      required: true,
    },
    seats: {
      type: Number,
      required: true,
    },
    luggage: {
      type: Number,
      required: true,
    },
    insurenceDate: {
      type: Date,
      required: true,
    },
    features: {
      type: Array,
      required: false,
    },
    description: {
      type: Array,
      required: false,

    },
    imageId: {
      type: String,
      required: false,

    },

  }, { timeseries: true });
  const Car = mongoose.model('cars', carSchema);
  module.exports = {
    Car,
  };
} catch {
  console.error('Error during admin login:', error);
  res.status(500).send('Internal Server Error');
}
