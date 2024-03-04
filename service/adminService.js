const { User } = require('../models/users');

const customers = async () => {
  try {
    const customer = await User.aggregate([
      { $unwind: '$bookedCar' },
      { $match: { 'bookedCar.status': 'Confirmed' } }, // Corrected case for 'confirmed'
      {
        $group: {
          _id: '$_id', // Group by name
          name: { $first: '$name' },
          totalPrize: { $sum: '$bookedCar.totalPrice' }, // Calculate sum of totalPrice
        },
      },
    ]);
    return customer;
  } catch (error) {
    console.error('Error in aggregation:', error);
    return [];
  }
};

module.exports = {
  customers,
};
