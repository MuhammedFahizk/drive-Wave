const { Booking } = require('../models/booking');

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
module.exports = {
  findCarAvailability,

};
