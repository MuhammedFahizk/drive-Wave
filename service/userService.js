/* eslint-disable camelcase */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/order */
/* eslint-disable no-underscore-dangle */
const { User } = require('../models/users');
const { Car } = require('../models/car'); // Assuming this is the correct path to your Car model
const { ObjectId } = require('mongoose').Types;
const Razorpay = require('razorpay');
const { createHmac } = require('crypto');

const { format } = require('date-fns');

const instance = new Razorpay({
  key_id: 'rzp_test_4n6m1t1iIOWyRe',
  key_secret: 'fubirzk5auoEq5AodmBFE5gD',
});

const findCarAvailability = async (pickDate, dropDate) => {
  try {
    const bookedCars = await User.aggregate([
      {
        $unwind: '$bookedCar',
      },
      {
        $match: {
          $or: [
            {
              $and: [
                { 'bookedCar.pickupDate': { $lte: dropDate } },
                { 'bookedCar.returnDate': { $gte: pickDate } },
              ],
            },
            {
              $and: [
                { 'bookedCar.pickupDate': { $gte: pickDate } },
                { 'bookedCar.returnDate': { $lte: dropDate } },
              ],
            },
            {
              $and: [
                { 'bookedCar.pickupDate': { $lt: pickDate } },
                { 'bookedCar.returnDate': { $gt: dropDate } },
              ],
            },
          ],
        },
      },
      {
        $group: {
          _id: '$bookedCar.car',
          count: { $sum: 1 },
        },
      },
    ]);
    const bookedCarIds = bookedCars.map((car) => car._id);

    const availableCars = await Car.find({
      _id: { $nin: bookedCarIds }, // Exclude cars that are booked
    });
    return availableCars;
  } catch (error) {
    console.error('Error finding availability:', error);
    throw error;
  }
};

// const pendingCarBooking = async () => {
// }

const confirm = async (_id, carId, userCheck) => {
  const bookingDate = new Date();
  const confirmArray = await User.aggregate([
    {
      $match: { _id: userCheck._id },
    },
    {
      $unwind: '$bookedCar',
    },
    {
      $match: {
        'bookedCar.car': new ObjectId(carId),
        $expr: {
          $and: [
            { $eq: [{ $dayOfMonth: '$bookedCar.bookingDate' }, { $dayOfMonth: bookingDate }] },
            { $eq: [{ $month: '$bookedCar.bookingDate' }, { $month: bookingDate }] },
            { $eq: [{ $year: '$bookedCar.bookingDate' }, { $year: bookingDate }] },
          ],
        },
      },
    },
  ]);

  return confirmArray;
};
const formattedDate = (date) => {
  const formatDate = new Date(date);
  const DateObj = new Date(formatDate);
  // Format the dates using date-fns
  return format(DateObj, 'yyyy/MM/dd');
};

const razerPayCreation = (orderId, total) => new Promise((resolve, reject) => {
  const options = {
    amount: total,
    currency: 'INR',
    receipt: orderId,
  };
  instance.orders.create(options, (err, order) => {
    if (err) {
      reject(err); // Reject the promise if there's an error
    } else {
      resolve(order); // Resolve the promise with the order
    }
  });
});
function verifyPayment(details) {
  try {
    return new Promise((resolve, reject) => {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = details.resp;
      const secret = 'fubirzk5auoEq5AodmBFE5gD'; // Replace with your actual secret key
      // Concatenate the order ID and payment ID with a '|' separator
      const message = `${razorpay_order_id}|${razorpay_payment_id}`;
      // Create an HMAC object with SHA-256 algorithm and your secret key
      const hmac = createHmac('sha256', secret);
      // Update the HMAC object with the message
      hmac.update(message);
      // Generate the digest (HMAC value) in hexadecimal format
      const generatedSignature = hmac.digest('hex');

      // Compare the generated HMAC with the received signature
      if (generatedSignature === razorpay_signature) {
        resolve();
      } else {
        reject(new Error('HMAC verification failed'));
      }
    });
  } catch (error) {
    console.error(error);
    return ('internal Server Error');
  }
}

const changeStatus = (bookingId, _id, method) => new Promise((resolve, reject) => {
  User.findOneAndUpdate(
    { _id, 'bookedCar._id': bookingId },
    {
      $set: { 'bookedCar.$.status': 'Confirmed' },
      'bookedCar.$.paymentMethod': method,
    },
    { new: true },
  )
    .then((updatedUser) => resolve(updatedUser))
    .catch((error) => reject(error));
});
const FeaturedCar = async () => {
  const mostBookedCar = await Car.aggregate([
    {
      $match: {
        bookings: { $exists: true, $ne: [] }, // Filter cars that have bookings
      },
    },
    {
      $project: {
        carName: 1,
        bookingsCount: { $size: '$bookings' },
        dayRent: 1,
        carModal: 1,
        carImage: 1,
      },
    },
    {
      $sort: { bookingsCount: -1 }, // Sort by bookingsCount in descending order
    },
    {
      $limit: 4, // Take only the first result, which will be the car with the most bookings
    },
  ]);
  return mostBookedCar;
};
module.exports = {
  findCarAvailability,
  confirm,
  formattedDate,
  razerPayCreation,
  verifyPayment,
  changeStatus,
  FeaturedCar,
};
