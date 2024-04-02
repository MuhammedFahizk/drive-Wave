const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const emailValidator = require('email-validator');
const { ObjectId } = require('mongoose').Types;
const {
  differenceInDays, parse,
} = require('date-fns');
const { User } = require('../models/users');
const { admin } = require('../models/owners');
const {
  sendAdminOtp, generateOtp, sendMailToAdmin,
} = require('../service/nodeMailer');
const { Car } = require('../models/car');
const userService = require('../service/userService');

async function getHomePageData() {
  try {
    const location = await Car.distinct('location').exec();
    const car = await userService.FeaturedCar();
    const Admin = await admin.findOne({ role: 'Admin' });
    const { banner } = Admin;
    return { location, car, banner };
  } catch (error) {
    throw new Error(`Error getting home page data: ${error.message}`);
  }
}

async function homePageHelper(req) {
  try {
    const { previous } = req.session;
    if (previous) {
      const { carId, dropDate, pickDate } = req.session;
      if (pickDate) {
        return `${previous}?carId=${carId}&&pickDate=${pickDate}&&dropDate=${dropDate}`;
      }
      return `${previous}?carId=${carId}`;
    }
    const { name } = req.session;
    const { location, car, banner } = await getHomePageData();
    return {
      name, location, car, banner,
    };
  } catch (error) {
    throw new Error('Error rendering home page');
  }
}

async function authenticateUser(email, password) {
  try {
    const user = await User.findOne({ role: 'user', email });

    if (!user) {
      throw new Error('User name or password is invalid');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Password is invalid');
    }

    return user;
  } catch (error) {
    throw new Error(`Error authenticating user: ${error.message}`);
  }
}

async function userLoginHelper(req) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new Error('Missing user name or password');
    }

    const user = await authenticateUser(email, password);

    const hashPassword = await bcrypt.hash(password, 10);

    req.session.password = hashPassword;
    req.session.name = user.name;
    req.session.email = email;
    req.session.userId = uuidv4();
    req.session._id = user._id;

    const { originalUrl } = req.session;
    if (originalUrl) {
      return originalUrl;
    }
    return '/';
  } catch (error) {
    throw new Error(error);
  }
}

async function getUserProfile(name) {
  try {
    const user = await User.findOne({ name });

    if (!user) {
      throw new Error('User not found');
    }

    // Compare hashed password

    const address = user.address[0];
    const message = user.deletedAt ? `${name} your account is Permanently Deleted` : null;

    return { user, address, message };
  } catch (error) {
    throw new Error(`Error fetching user profile: ${error.message}`);
  }
}

async function renderProfilePag(req) {
  try {
    if (!req.session) {
      throw new Error('Session not found');
    }

    const { name, password } = req.session;
    const { user, address, message } = await getUserProfile(name, password);

    return {
      data: user, name, address, message,
    };
  } catch (error) {
    throw new Error(`Error rendering profile page: ${error.message}`);
  }
}

function updateUserHelper(editId, updateValues) {
  return User.findByIdAndUpdate(
    editId,
    { $set: updateValues },
    { new: true },
  )
    .then((updatedUser) => {
      if (!updatedUser) {
        throw new Error('User not found');
      }
      return updatedUser;
    })
    .catch((error) => {
      throw error;
    });
}
function allCarsHelper(location) {
  return new Promise((resolve, reject) => {
    let carsQuery = Car.find();

    if (location) {
      carsQuery = carsQuery.where('location').equals(location);
    }

    carsQuery.then((cars) => {
      Car.distinct('location').exec()
        .then((locations) => {
          resolve({ cars, locations });
        })
        .catch((error) => {
          reject(error);
        });
    })
      .catch((error) => {
        reject(error);
      });
  });
}

async function specifiedCars(pickDate, dropDate, location) {
  const pickDateNew = new Date(pickDate);
  const dropDateNew = new Date(dropDate);
  const availability = await userService.findCarAvailability(pickDateNew, dropDateNew);
  const AvailabilityId = availability.map((entry) => entry._id);

  const model = [{
    $match: {
      _id: { $in: AvailabilityId },
    },
  }];

  let allCollections = await Car.aggregate(model);

  if (location) {
    allCollections = allCollections.filter((car) => car.location === location);
  }

  const locations = await Car.distinct('location').exec();

  return { allCollections, locations };
}
async function
// eslint-disable-next-line max-len
filterCars(transmission, fuel, carCategory, sessionLocation, pickDate, dropDate, search, sortOrder) {
  let location;
  if (!sessionLocation) {
    location = await Car.distinct('location').exec();
  } else {
    location = [sessionLocation];
  }
  let AvailabilityId = [];
  const matchConditions = {
    TransmitionType: { $in: transmission },
    fuelType: { $in: fuel },
    carCategory: { $in: carCategory },
    location: { $in: location },
    carName: { $regex: search, $options: 'i' }, // Search by car name (case-insensitive)
  };

  if (pickDate && dropDate) {
    const pickDateData = new Date(pickDate);
    const dropDateData = new Date(dropDate);
    const availability = await userService.findCarAvailability(pickDateData, dropDateData);
    AvailabilityId = availability.map((entry) => entry._id);
    matchConditions._id = { $in: AvailabilityId };
  }
  if (sortOrder !== 0) {
    const sortStage = {
      $sort: {
        dayRent: sortOrder, // Sort by dayRent field (price) based on sortOrder
      },
    };
    const model = [{ $match: matchConditions }, sortStage];
    const allCollections = await Car.aggregate(model);

    return allCollections;
  }

  const model = [{ $match: matchConditions }];
  const allCollections = await Car.aggregate(model);

  return allCollections;
}

async function carDetailsUserHelper(id, name) {
  const cars = await Car.findById(id);
  const { fuelType, carCategory } = cars;

  let carData = await Car.aggregate([
    {
      $match: {
        $or: [
          { carCategory },
          { fuelType },
        ],
      },
    },
    {
      $limit: 7,
    },
  ]);

  carData = carData.filter((car) => car._id.toString() !== id);

  return { car: cars, data: carData, name };
}
async function bookingDate(id) {
  try {
    const bookings = await User.aggregate([
      {
        $unwind: '$bookedCar', // Deconstruct bookedCar array
      },
      {
        $match: {
          'bookedCar.car': new ObjectId(id), // Match carId
        },
      },
      {
        $project: {
          _id: 0, // Exclude _id field
          pickupDate: '$bookedCar.pickupDate',
          returnDate: '$bookedCar.returnDate',
          // Project bookedCar object as 'booking'
        },
      },
    ]);
    return bookings;
  } catch (error) {
    console.error('Error finding bookings:', error);
    throw error;
  }
}
const emailOtp = {};

async function generateOtpEmailHelper(email) {
  const otp = generateOtp();
  console.error(otp, email);

  emailOtp[email] = otp;

  await sendAdminOtp(email, otp);

  return email;
}
async function userOtpCheckHelper(otp, email) {
  if (emailOtp[email] && emailOtp[email] === otp) {
    const user = await User.findOne({ role: 'user', email });
    if (user) {
      delete emailOtp[email];
      const hashPassword = await bcrypt.hash(user.password.toString(), 10);
      const userId = uuidv4();
      return { user, userId, hashPassword }; // Return as an object
    }
    throw new Error('User not found');
  } else {
    throw new Error('Invalid OTP');
  }
}

async function forgotPasswordHelper(email, newPassword) {
  const user = await User.findOne({ email, role: 'user' });
  if (!user) {
    throw new Error('User not found');
  }

  const hashPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashPassword;
  await user.save();

  return user;
}

async function otpCheckHelper(otp, email) {
  return new Promise((resolve, reject) => {
    if (emailOtp[email] && emailOtp[email] === otp) {
      resolve('ok');
    } else {
      reject(new Error('Not Match Otp'));
    }
  });
}

async function registrationHelper(userData) {
  const {
    name,
    age,
    password,
    email,
    phone,
    licenseNumber,
  } = userData;

  const isValid = emailValidator.validate(email);
  if (!isValid) {
    throw new Error('Invalid email format');
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    name,
    age,
    password: hashPassword,
    email,
    phone,
    licenseNumber,
    role: 'user',
  });

  await newUser.save();

  return {
    name, password: hashPassword, _id: newUser._id, userId: uuidv4(),
  };
}
async function userMessageToAdminHelper(email, message, subject) {
  return new Promise((resolve, reject) => {
    if (!email) {
      reject(new Error('Email address is required'));
      return;
    }

    sendMailToAdmin(email, message, subject, (error) => {
      if (error) {
        reject(new Error(error));
      } else {
        resolve('Successfully sent message');
      }
    });
  });
}

async function bookingCarHelper(sessionData, _id, name, carId) {
  const {
    pickDate, dropDate, bookingId,
  } = sessionData;
  const car = await Car.findById(carId);
  const user = await User.findById(_id);
  if (!car || !user) {
    throw new Error('Car or user not found');
  }
  if (!pickDate || !dropDate) {
    return { car, user };
  }

  const formattedPickDate = userService.formattedDate(pickDate);
  const formattedDropDate = userService.formattedDate(dropDate);
  const dayDifferenceIn = differenceInDays(dropDate, pickDate);

  const amount = car.dayRent * dayDifferenceIn;
  if (bookingId) {
    const userWithBooking = await User.findOne({ 'bookedCar._id': bookingId }).populate('bookedCar.services');
    const bookings = userWithBooking.bookedCar
      .find((booking) => booking._id.toString() === bookingId);
    const { services } = bookings;
    let service = null;

    if (!car.ownerId) {
      const adminDoc = await admin.findOne({ role: 'Admin' }).populate('service');
      service = adminDoc.service.filter((serviceData) => services.includes(serviceData._id));
    } else {
      const vendorDoc = await admin.findOne({ _id: car.ownerId }).populate('service');
      service = vendorDoc.service.filter((serviceData) => services.includes(serviceData._id));
    }

    return {
      car,
      user: userWithBooking,
      name,
      amount,
      totalAmount: bookings.totalPrice,
      dayDifferenceIn,
      formattedPickDate,
      formattedDropDate,
      payment: 'payment',
      bookingId,
      service,
    };
  }

  const service = [];

  if (!car.ownerId) {
    const adminData = await admin.findOne({ role: 'Admin' });
    if (adminData) {
      service.push(...adminData.service);
    }
  } else {
    const vendorData = await admin.findOne({ _id: car.ownerId });
    if (vendorData) {
      service.push(...vendorData.service);
    }
  }
  return {
    car,
    user,
    name,
    amount,
    dayDifferenceIn,
    formattedPickDate,
    formattedDropDate,
    service,
  };
}

async function addDateHelper(pickDate, dropDate, carId) {
  const pickDateNew = new Date(pickDate);
  const dropDateNew = new Date(dropDate);

  let AvailabilityId = await userService.findCarAvailability(pickDateNew, dropDateNew);
  // Filter the availabilityIds array to check if carId exists
  AvailabilityId = AvailabilityId.map((entry) => entry._id);

  const matchingCars = AvailabilityId.filter((id) => id.toString() === carId);
  // If matchingCars array is empty, the car is available
  if (matchingCars.length !== 0) {
    return 'ok';
  }
  throw new Error('Car is already booked');

  // If matchingCars array is not empty, the car is already booked
}

async function userBookedCarHelper(formDatas, service, sessionData, _id) {
  const { place, zip, houseName } = formDatas;
  const {
    carId, pickDate, dropDate,
  } = sessionData;

  const user = await User.findByIdAndUpdate(_id, {
    address: { place, zip, houseName },
  }, { new: true });

  if (!user) {
    throw new Error('User not found');
  }

  const car = await Car.findById(carId);
  const userCheck = await User.findById(_id).populate('bookedCar');
  const confirmArray = await userService.confirm(_id, carId, userCheck);

  if (confirmArray.length > 0) {
    throw new Error('Car is already booked');
  }

  let foundServices = null;
  let serviceAmount = 0;

  if (service) {
    if (!car.ownerId) {
      const adminDoc = await admin.findOne({ role: 'Admin' });
      foundServices = adminDoc.service.filter((serviceData) => service
        .includes(serviceData._id.toString()));
    } else {
      const vendorDoc = await admin.findOne({ _id: car.ownerId });
      foundServices = vendorDoc.service.filter((serviceData) => service
        .includes(serviceData._id.toString()));
    }

    foundServices.forEach((element) => {
      serviceAmount += element.charge;
    });
  }
  const parsedPickDate = parse(pickDate, 'yyyy-MM-dd HH:mm', new Date());
  const parsedDropDate = parse(dropDate, 'yyyy-MM-dd HH:mm', new Date());

  // Calculate the difference in days
  const days = differenceInDays(parsedDropDate, parsedPickDate);
  const amount = days * car.dayRent;
  const bookingData = {
    car: carId,
    bookingDate: new Date(),
    pickupDate: pickDate,
    returnDate: dropDate,
    carRent: amount,
    totalPrice: amount + serviceAmount,
    totalDays: days,
    status: 'Pending',
    services: foundServices,
  };

  const updatedUser = await User.findByIdAndUpdate(
    _id,
    { $addToSet: { bookedCar: bookingData } },
    { new: true },
  );

  const newBookingId = updatedUser.bookedCar[updatedUser.bookedCar.length - 1]._id;

  const total = amount + serviceAmount;
  const razerPay = await userService.razerPayCreation(newBookingId, total * 100);

  await User.findOneAndUpdate(
    { _id, 'bookedCar._id': newBookingId },
    { $set: { 'bookedCar.$.payment_id': razerPay.id } },
  );

  return { razerPay, formDatas, newBookingId };
}

async function fetchBookedCars(_id) {
  try {
    const pipeline = [
      {
        $match: {
          _id: new ObjectId(_id), // Convert userId to ObjectId type
        },
      },
      {
        $unwind: '$bookedCar', // Flatten the bookedCar array
      },
      {
        $match: {
          $or: [
            { 'bookedCar.status': 'Pending' },
            { 'bookedCar.status': 'Confirmed' },
            { 'bookedCar.status': 'Not Picked' },
          ],
        },
      },
      {
        $lookup: {
          from: 'cars', // Name of the Car collection
          localField: 'bookedCar.car',
          foreignField: '_id',
          as: 'bookedCar.carDetails',
        },
      },
      {
        $unwind: '$bookedCar.carDetails', // Deconstruct the carDetails array
      },
      {
        $project: {
          _id: 0,
          'bookedCar._id': 1,
          'bookedCar.car': 1,
          'bookedCar.bookingDate': 1,
          'bookedCar.pickupDate': 1,
          'bookedCar.returnDate': 1,
          'bookedCar.totalPrice': 1,
          'bookedCar.totalDays': 1,
          'bookedCar.status': 1,
          'bookedCar.carDetails': '$bookedCar.carDetails',
          // Include other fields you want to project
        },
      },
    ];

    const historyPipeline = [
      {
        $match: {
          _id: new ObjectId(_id), // Convert userId to ObjectId type
        },
      },
      {
        $unwind: '$bookedCar', // Flatten the bookedCar array
      },
      {
        $match: {
          $or: [
            { 'bookedCar.status': 'Completed' },
            { 'bookedCar.status': 'Overdue' },
            { 'bookedCar.status': 'In Progress' },

          ],
        },
      },
      {
        $lookup: {
          from: 'cars', // Name of the Car collection
          localField: 'bookedCar.car',
          foreignField: '_id',
          as: 'bookedCar.carDetails',
        },
      },
      {
        $unwind: '$bookedCar.carDetails', // Deconstruct the carDetails array
      },
      {
        $project: {
          _id: 0,
          'bookedCar._id': 1,
          'bookedCar.car': 1,
          'bookedCar.bookingDate': 1,
          'bookedCar.pickupDate': 1,
          'bookedCar.returnDate': 1,
          'bookedCar.totalPrice': 1,
          'bookedCar.totalDays': 1,
          'bookedCar.status': 1,
          'bookedCar.carDetails': '$bookedCar.carDetails',
          // Include other fields you want to project
        },
      },
    ];

    // Execute the aggregation
    const user = await User.aggregate(pipeline);
    const history = await User.aggregate(historyPipeline);
    return { user, history } || null;
  } catch (error) {
    throw new Error('Error fetching booked cars');
  }
}

async function bookedCarsHelper(req) {
  try {
    const { _id, name } = req.session;
    if (!_id) {
      return { data: [], name, count: 0 };
    }

    const bookedCarData = await fetchBookedCars(_id);
    const count = bookedCarData ? bookedCarData.length : 0;

    return { data: bookedCarData, name, count };
  } catch (error) {
    throw new Error(error.message);
  }
}

async function removeBookingHelper(userId, bookingId) {
  try {
    if (!userId || !bookingId) {
      throw new Error('User ID or Booking ID not provided');
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { bookedCar: { _id: new ObjectId(bookingId) } } },
      { new: true },
    );

    await user.save();

    return user;
  } catch (error) {
    throw new Error('Error removing booking');
  }
}

async function removeBookingsHelper(req) {
  try {
    const { id } = req.query;
    const { _id } = req.session;
    if (!id || !_id) {
      throw new Error('ID not provided');
    }
    await removeBookingHelper(_id, id);
    return true; // Indicate successful removal
  } catch (error) {
    throw new Error(error.message);
  }
}
async function getCarDetails(bookingId, userId) {
  try {
    const user = await User.findById(userId).populate('bookedCar.car');
    const thisBooking = user.bookedCar.find((booking) => booking._id.toString() === bookingId);
    const { car } = thisBooking;

    const { services } = thisBooking;
    let service = null;
    if (!car.ownerId) {
      const adminDoc = await admin.findOne({ role: 'Admin' }).populate('service');
      service = adminDoc.service.filter(
        (serviceData) => services.includes(serviceData._id),
      );
    } else {
      const vendorDoc = await admin.findOne({ _id: car.ownerId }).populate('service');
      service = vendorDoc.service.filter(
        (serviceData) => services.includes(serviceData._id),
      );
    }
    return { thisBooking, service };
  } catch (error) {
    console.error(error);
    throw error;
  }
}
async function verifyPaymentAndUpdateUser(sessionId, requestBody) {
  try {
    const { _id } = sessionId;
    await userService.verifyPayment(requestBody);
    const updatedUser = await userService
      .changeStatus(requestBody.bookingId, _id, requestBody.method);
    await userService.sendInvoiceEmail(_id, requestBody.bookingId);
    return updatedUser;
  } catch (error) {
    console.error('Payment verification failed:', error);
    throw error;
  }
}
async function getOrderDetails(sessionId, bookingId) {
  const { _id } = sessionId;
  const user = await User.findById(_id).populate('bookedCar.car');
  const thisCar = user.bookedCar.find((bookings) => bookings.id.toString() === bookingId);

  if (!thisCar) {
    throw new Error('Error finding booking details');
  }
  return { thisCar, user };
}

async function saveRecoveryMessage(userId, messageData) {
  // Find the admin with the role 'Admin'
  const adminDoc = await admin.findOne({ role: 'Admin' });

  if (!adminDoc) {
    throw new Error('Admin not found');
  }

  adminDoc.notifications.push({
    userId,
    message: messageData.message,
    sender: messageData.sender,
    createdAt: new Date(),
  });
  await adminDoc.save();

  return true;
}
async function addReview(id, formData) {
  try {
    const { message, rate, carId } = formData;
    const user = await User.findById(id);

    // Find the car by its ID and update its rating array with the new review data
    const updatedCar = await Car.findByIdAndUpdate(
      carId, // Car ID
      { $push: { rating: { description: message, rate, name: user.name } } },
      { new: true },
    );

    let sumOfRates = 0;
    let count = 0;
    updatedCar.rating.forEach((review) => {
      sumOfRates += review.rate;
      count += count;
    });

    const averageRate = Math.round(sumOfRates / count);
    updatedCar.rate = averageRate;

    await updatedCar.save();

    return true;
  } catch (error) {
    console.error('Error while adding review:', error);
    throw error; // Throw the error for handling in the calling function
  }
}
async function allCarHelper() {
  try {
    // Fetch all cars
    const cars = await Car.find();

    // Fetch distinct locations
    const locations = await Car.distinct('location');

    // Return cars and locations
    return { cars, locations };
  } catch (error) {
    // Handle errors
    console.error('Error fetching cars and locations:', error);
    throw error; // Rethrow the error to be handled by the caller
  }
}
module.exports = {
  homePageHelper,
  userLoginHelper,
  renderProfilePag,
  updateUserHelper,
  allCarsHelper,
  specifiedCars,
  filterCars,
  carDetailsUserHelper,
  bookingDate,
  generateOtpEmailHelper,
  userOtpCheckHelper,
  forgotPasswordHelper,
  otpCheckHelper,
  registrationHelper,
  userMessageToAdminHelper,
  bookingCarHelper,
  addDateHelper,
  userBookedCarHelper,
  bookedCarsHelper,
  removeBookingsHelper,
  getCarDetails,
  verifyPaymentAndUpdateUser,
  getOrderDetails,
  saveRecoveryMessage,
  addReview,
  allCarHelper,
};
