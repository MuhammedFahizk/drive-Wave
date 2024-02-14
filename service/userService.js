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
const addLocationAndDate = async (pickDateInput, dropDateInput, dayRent) => {
  const pickDate = new Date(pickDateInput);
  const dropDate = new Date(dropDateInput);
  let data = {};

  if (Number.isNaN(pickDate.getTime()) || Number.isNaN(dropDate.getTime())) {
    console.error('pickDate or dropDate is invalid');
    // Changed to || instead of &&
    console.error('pickDate and dropDate not defined');
  } else {
    const differenceInMilliSecond = dropDate - pickDate;
    const date = differenceInMilliSecond / (1000 * 60 * 60 * 24);

    data = {
      date,
      rate: dayRent * date,
      pickDate,
      dropDate,
    };
  }
  return data;
};
// const pendingCarBooking = async () => {
// }
module.exports = {
  findCarAvailability,
  addLocationAndDate,
  // pendingCarBooking,
};
