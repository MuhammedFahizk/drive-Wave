/* eslint-disable import/order */
/* eslint-disable no-underscore-dangle */
const { Booking } = require('../models/booking');
const { User } = require('../models/users');
const { ObjectId } = require('mongoose').Types;

const { format } = require('date-fns');

const findCarAvailability = async (pickDate, dropDate) => {
  const model = [
    {
      $match:
     {
       $or: [
         {
           pickDate: { $gte: pickDate, $lte: dropDate },
         },
         {
           dropDate: { $gte: pickDate, $lte: dropDate },
         },
       ],
     },
    },
    {
      $group: {
        _id: '$cars',
        count: { $sum: 1 },
      },
    },
  ];

  try {
    const availability = await Booking.aggregate(model);
    return availability;
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

module.exports = {
  findCarAvailability,
  confirm,
  formattedDate,
};
