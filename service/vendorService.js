/* eslint-disable import/order */
/* eslint-disable no-underscore-dangle */
const { User } = require('../models/users');
const { ObjectId } = require('mongoose').Types;

const customers = async (ownerId) => {
  try {
    const customer = await User.aggregate([
      { $unwind: '$bookedCar' },
      { $match: { 'bookedCar.status': 'Confirmed' } },
      {
        $lookup: {
          from: 'cars',
          localField: 'bookedCar.car',
          foreignField: '_id',
          as: 'carsData',
        },
      },
      {
        $addFields: {
          ownerIdInCarsData: { $arrayElemAt: ['$carsData.ownerId', 0] },
        },
      },
      {
        $lookup: {
          from: 'cars',
          localField: 'bookedCar.car',
          foreignField: '_id',
          as: 'carDetails',
        },
      },
      {
        $match: { 'carDetails.ownerId': new ObjectId(ownerId) },
      },
      {
        $group: {
          _id: '$_id',
          name: { $first: '$name' },
          totalPrize: { $sum: '$bookedCar.totalPrice' },
          cars: { $addToSet: '$carDetails' },
        },
      },
    ]);

    return customer;
  } catch (error) {
    console.error('Error in aggregation:', error);
    return [];
  }
};

const dailyRents = () => {
  const today = new Date(); // Get current date
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const last7DaysNames = [];

  for (let i = 7; i >= 1; i -= 1) {
    const date = new Date(today); // Create a new date object for each day
    date.setDate(today.getDate() - i); // Subtract i days from the current date

    // Get the name of the day using the day of the week index
    const dayName = dayNames[date.getDay()];
    last7DaysNames.push(dayName); // Add the day name to the array
  }

  return last7DaysNames;
};
const dailyRentalAmounts = async (ownerId) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const sevenDaysAgo = new Date(startOfToday);
  sevenDaysAgo.setDate(startOfToday.getDate() - 6); // Subtract 6 days to get 7 days ago

  // Generate an array of date strings for the last 7 days
  const dateStrings = [];
  for (let i = 0; i < 7; i += 1) {
    const date = new Date(startOfToday);
    date.setDate(startOfToday.getDate() - i);
    dateStrings.push(date.toISOString().split('T')[0]); // Extract date string in YYYY-MM-DD format
  }

  // Perform aggregation to get rental amounts
  const rentAmount = await User.aggregate([
    { $unwind: '$bookedCar' },
    {
      $lookup: {
        from: 'cars',
        localField: 'bookedCar.car',
        foreignField: '_id',
        as: 'carDetails',
      },
    },
    {
      $match: {
        'bookedCar.bookingDate': { $gte: sevenDaysAgo, $lte: startOfToday },
        'bookedCar.status': 'Confirmed',
        'carDetails.ownerId': new ObjectId(ownerId),
      },
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$bookedCar.bookingDate' } },
        },
        totalRentalAmount: { $sum: '$bookedCar.totalPrice' },
      },
    },
  ]);

  // Create an object to store rental amounts for each day
  const rentalAmountsByDay = {};
  rentAmount.forEach((item) => {
    rentalAmountsByDay[item._id.date] = item.totalRentalAmount;
  });

  // Create an array with rental amounts for each day, adding 0 for days with no data
  const rentalAmounts = dateStrings.map((dateString) => ({
    date: dateString,
    totalRentalAmount: rentalAmountsByDay[dateString] || 0,
  }));
  rentalAmounts.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA - dateB;
  });
  return rentalAmounts;
};

const dailyRentalAmountPending = async (ownerId) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const sevenDaysAgo = new Date(startOfToday);
  sevenDaysAgo.setDate(startOfToday.getDate() - 6); // Subtract 6 days to get 7 days ago

  // Generate an array of date strings for the last 7 days including today
  const dateStrings = [];
  for (let i = 0; i < 7; i += 1) {
    const date = new Date(startOfToday);
    date.setDate(startOfToday.getDate() - i);
    dateStrings.push(date.toISOString().split('T')[0]); // Extract date string in YYYY-MM-DD format
  }

  // Perform aggregation to get rental amounts
  const rentAmount = await User.aggregate([
    { $unwind: '$bookedCar' },
    {
      $lookup: {
        from: 'cars',
        localField: 'bookedCar.car',
        foreignField: '_id',
        as: 'carDetails',
      },
    },
    {
      $match: {
        'bookedCar.bookingDate': { $gte: sevenDaysAgo, $lte: startOfToday },
        'bookedCar.status': 'pending',
        'carDetails.ownerId': new ObjectId(ownerId),
      },
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$bookedCar.bookingDate' } },
        },
        totalRentalAmount: { $sum: '$bookedCar.totalPrice' },
      },
    },
  ]);

  // Create an object to store rental amounts for each day
  const rentalAmountsByDay = {};
  rentAmount.forEach((item) => {
    rentalAmountsByDay[item._id.date] = item.totalRentalAmount;
  });

  // Create an array with rental amounts for each day, adding 0 for days with no data
  const rentalAmounts = dateStrings.map((dateString) => ({
    date: dateString,
    totalRentalAmount: rentalAmountsByDay[dateString] || 0,
  }));
  rentalAmounts.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA - dateB;
  });
  return rentalAmounts;
};

const dailyRentalAmount = async () => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const sevenDaysAgo = new Date(startOfToday);
  sevenDaysAgo.setDate(startOfToday.getDate() - 6); // Subtract 6 days to get 7 days ago

  // Generate an array of date strings for the last 7 days
  const dateStrings = [];
  for (let i = 0; i < 7; i += 1) {
    const date = new Date(startOfToday);
    date.setDate(startOfToday.getDate() - i);
    dateStrings.push(date.toISOString().split('T')[0]); // Extract date string in YYYY-MM-DD format
  }

  // Perform aggregation to get rental amounts
  const rentAmount = await User.aggregate([
    { $unwind: '$bookedCar' },
    {
      $match: {
        'bookedCar.bookingDate': { $gte: sevenDaysAgo, $lte: startOfToday },
        'bookedCar.status': 'Confirmed',
      },
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$bookedCar.bookingDate' } },
        },
        totalRentalAmount: { $sum: '$bookedCar.totalPrice' },
      },
    },
  ]);

  // Create an object to store rental amounts for each day
  const rentalAmountsByDay = {};
  rentAmount.forEach((item) => {
    rentalAmountsByDay[item._id.date] = item.totalRentalAmount;
  });

  // Create an array with rental amounts for each day, adding 0 for days with no data
  const rentalAmounts = dateStrings.map((dateString) => ({
    date: dateString,
    totalRentalAmount: rentalAmountsByDay[dateString] || 0,
  }));
  rentalAmounts.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA - dateB;
  });
  return rentalAmounts;
};
const confirmAmount = async (ownerId) => {
  const sum = await User.aggregate([
    {
      $unwind: '$bookedCar',
    },
    {
      $lookup: {
        from: 'cars',
        localField: 'bookedCar.car',
        foreignField: '_id',
        as: 'carDetails',
      },
    },
    {
      $unwind: '$carDetails', // Deconstruct carDetails array
    },
    {
      $match: {
        'carDetails.ownerId': new ObjectId(ownerId),
      },
    },
    {
      $match: {
        'bookedCar.status': 'Confirmed',
      },
    },
    {
      $group: {
        _id: 0,
        totalRentalAmount: { $sum: '$bookedCar.totalPrice' },
      },
    },
  ]);
  const [{ totalRentalAmount = 0 } = {}] = sum;

  return totalRentalAmount;
};
const pendingAmount = async (ownerId) => {
  const sum = await User.aggregate([
    {
      $unwind: '$bookedCar',
    },
    {
      $lookup: {
        from: 'cars',
        localField: 'bookedCar.car',
        foreignField: '_id',
        as: 'carDetails',
      },
    },
    {
      $unwind: '$carDetails', // Deconstruct carDetails array
    },
    {
      $match: {
        'carDetails.ownerId': new ObjectId(ownerId),
      },
    },
    {
      $match: {
        'bookedCar.status': 'pending',
      },
    },
    {
      $group: {
        _id: 0,
        totalRentalAmount: { $sum: '$bookedCar.totalPrice' },
      },
    },
  ]);
  const [{ totalRentalAmount = 0 } = {}] = sum;
  return totalRentalAmount;
};
module.exports = {
  customers,
  dailyRentalAmounts,
  dailyRents,
  dailyRentalAmountPending,
  dailyRentalAmount,
  confirmAmount,
  pendingAmount,
};
