const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const helper = require('../helpers/userHelper');

async function getHomePage(req, res) {
  try {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    let { name } = req.session;
    req.session.booking = {};
    const data = await helper.homePageHelper(req);
    if (!name) {
      name = data.name;
    }
    if (name) {
      res.render('user/index', {
        car: data.car, locations: data.location, banner: data.banner, name: data.name,
      });
    } else {
      res.render('user/index', { car: data.car, locations: data.location, banner: data.banner });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json('Internal server error');
  }
}
const loginPage = (req, res) => {
  if (req.session.userId) {
    return res.redirect('/');
  }
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  return res.render('user/login');
};

async function userLogin(req, res) {
  try {
    const redirectUrl = await helper.userLoginHelper(req);
    res.redirect(redirectUrl);
  } catch (error) {
    res.render('user/login', { error: 'Mismatch Password Or Email' });
  }
}

async function profilePage(req, res) {
  try {
    const userProfileData = await helper.renderProfilePag(req);
    res.status(200).render('user/profile', userProfileData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function logoutUser(req, res) {
  try {
    if (req.session.userId) {
      req.session.destroy((error) => {
        if (error) {
          console.error(error);
        } else {
          res.redirect('/');
        }
      });
    }
  } catch {
    res.status(500).json({ error: 'server Error' });
  }
}
async function updateUser(req, res) {
  try {
    const { editId } = req.query;
    const {
      name,
      age,
      password,
      email,
      phone,
      houseName,
      zip,
      place,
      licenseNumber,
    } = req.body;

    const updateValues = {
      name,
      age,
      password,
      email,
      licenseNumber,
      address: {
        place,
        zip,
        houseName,
      },
      phone,
    };

    if (!editId || !updateValues) {
      throw new Error('Invalid parameters');
    }

    const updatedUser = await helper.updateUserHelper(editId, updateValues);
    if (!updatedUser) {
      return res.status(400).redirect('/');
    }
    req.session.name = name;
    return res.status(200).redirect('/profile');
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server Error' });
  }
}
async function deleteUser(req, res) {
  const { deleteId } = req.query;
  try {
    if (!deleteId) {
      return res.status(400).json('Missing deleteId parameter');
    }

    const deleteUserById = await helper.deleteUserByIdHelper(deleteId);
    if (!deleteUserById) {
      return res.status(404).json('User not found');
    }

    req.session.userId = '';
    req.session.name = '';
    req.session.password = '';
    return res.status(200).redirect('/');
  } catch (error) {
    console.error('Error deleting user', error);
    return res.status(500).json('Internal Server Error');
  }
}
async function showCars(req, res) {
  try {
    const { pickDate, dropDate, location } = req.session.booking || {};
    const { name } = req.session;
    req.session.booking = req.session.booking || {};

    let allCollections = [];
    let locations = [];

    if (pickDate && dropDate) {
      req.session.booking = { pickDate, dropDate };

      const { allCollections: specifiedCarsData, locations: specifiedLocations } = await helper
        .specifiedCars(pickDate, dropDate, location);
      allCollections = specifiedCarsData;
      locations = specifiedLocations;
    } else if (location) {
      const { cars, locations: allLocations } = await helper.allCarsHelper(location);
      allCollections = cars;
      locations = allLocations;
    } else {
      const { cars, locations: allLocations } = await helper.allCarsHelper();
      allCollections = cars;
      locations = allLocations;
    }

    res.render('user/cars', {
      data: allCollections,
      name,
      locations,
      location,
      pickDate,
      dropDate,
    });
  } catch (error) {
    console.error('Error showing cars:', error);
    res.status(500).json('Internal Server Error');
  }
}
const allCars = async (req, res) => {
  const { name } = req.session;
  req.session.booking = {};
  const data = await helper.allCarHelper();
  res.render('user/cars', { data: data.cars, locations: data.locations, name });
};
async function filterCars(req, res) {
  try {
    const {
      transmission, fuel, carCategory, search, sortOrder,
    } = req.body;
    const { location, pickDate, dropDate } = req.session.booking;

    const allCollections = await helper
      .filterCars(transmission, fuel, carCategory, location, pickDate, dropDate, search, sortOrder);

    res.status(200).json(allCollections);
  } catch (error) {
    console.error('Error filtering cars:', error);
    res.status(500).json('Internal Server Error');
  }
}
async function carDetailsUser(req, res) {
  try {
    const { name } = req.session;
    const { id } = req.query;
    const { car, data } = await helper.carDetailsUserHelper(id, name);
    const bookings = await helper.bookingDate(id);
    res.status(200).render('user/carDetails', {
      car, data, name, bookings,
    });
  } catch (error) {
    console.error('Error Details User:', error);
    res.status(500).json('Internal Server Error');
  }
}

async function generateOtpEmail(req, res) {
  try {
    const { email } = req.body;

    const generatedEmail = await helper.generateOtpEmailHelper(email);

    res.status(201).json(generatedEmail);
  } catch (error) {
    console.error('Error generating OTP email:', error);
    res.status(500).json('Internal Server Error');
  }
}

async function registration(req, res) {
  try {
    const userData = req.body;
    const sessionData = await helper.registrationHelper(userData);

    // Store session data if necessary
    req.session.name = sessionData.name;
    req.session.password = sessionData.password;
    req.session._id = sessionData._id;
    req.session.userId = sessionData.userId;

    res.status(200).json('ok');
  } catch (error) {
    res.status(500).json({ error: 'Server Error', details: error });
  }
}

async function userOtpCheck(req, res) {
  try {
    const { otp, Email } = req.body;
    console.error(Email);

    const result = await helper.userOtpCheckHelper(otp, Email);

    req.session.password = result.hashPassword;
    req.session.name = result.user.name;
    req.session.email = result.user.email;
    req.session.userId = result.userId;
    res.status(200).json('ok');
  } catch (error) {
    console.error('Error checking OTP for user:', error);
    res.status(404).redirect('/login');
  }
}

async function OtpCheck(req, res) {
  try {
    const { otp, Email } = req.body;
    const result = await helper.otpCheckHelper(otp, Email);
    res.status(201).json(result);
  } catch (error) {
    res.status(404).json(error);
  }
}
async function forgotPassword(req, res) {
  const { email, password } = req.body;
  try {
    const user = await helper.forgotPasswordHelper(email, password);

    // Assuming session data is stored in the controller
    req.session.password = await bcrypt.hash(password, 10);
    req.session.email = email;
    req.session.userId = uuidv4();
    req.session._id = user._id;
    req.session.name = user.name;

    // Add other session data if necessary

    const { originalUrl } = req.session;
    if (originalUrl) {
      res.redirect(originalUrl);
    } else {
      res.status(200).json('Password updated successfully');
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}

const contactPage = (req, res) => {
  const { name } = req.session;
  res.status(200).render('user/contact', { name });
};

async function userMessageToAdmin(req, res) {
  try {
    const { email, subject, message } = req.body;

    const result = await helper.userMessageToAdminHelper(email, message, subject);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error sending message to admin:', error);
    res.status(500).json({ error: 'Server Error', details: error });
  }
}

const aboutPage = (req, res) => {
  const { name } = req.session;
  res.status(200).render('user/about', { name });
};

async function bookingCar(req, res) {
  try {
    const sessionData = req.session.booking || {};
    let queryCarId = req.query.carId;
    if (!queryCarId) {
      queryCarId = req.session.booking.carId;
    }
    req.session.booking = { ...req.session.booking, carId: queryCarId };
    const result = await helper
      .bookingCarHelper(sessionData, req.session._id, req.session.name, queryCarId);
    result.name = req.session.name;
    const bookings = await helper.bookingDate(queryCarId);
    result.bookings = bookings;
    res.status(200).render('user/checkOut', result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error', details: error });
  }
}

async function addDate(req, res) {
  try {
    const { pickDate, dropDate } = req.query;
    const { carId } = req.session.booking;

    const result = await helper.addDateHelper(pickDate, dropDate, carId);
    if (pickDate && dropDate) {
      req.session.booking = { ...req.session.booking, pickDate, dropDate };
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
}

const changeDate = async (req, res) => {
  // const { pickDate, dropDate } = req.query;
  req.session.booking = { pickDate: '', dropDate: '', carId: req.session.booking.carId };

  res.status(200).json('success');
};

const findCarByDate = async (req, res) => {
  const { pickDate, dropDate, location } = req.body;
  if (!pickDate || !dropDate) {
    if (location) {
      req.session.booking = { location };
    }
    return res.redirect('/cars');
  }
  req.session.booking = { pickDate, dropDate, location };
  return res.redirect('/cars');
};
async function userRecoveryMessage(req, res) {
  try {
    const { _id } = req.session;
    const { message, sender } = req.body;

    await helper.saveRecoveryMessage(_id, { message, sender });

    return res.status(201).redirect('/profile');
  } catch (error) {
    console.error('Error processing the recovery message:', error);
    return res.status(500).send('An error occurred while processing the recovery message');
  }
}
// eslint-disable-next-line consistent-return
async function userBookedCar(req, res) {
  try {
    const { formDatas, service } = req.body;
    const sessionData = req.session.booking;
    const { _id } = req.session;
    const result = await helper.userBookedCarHelper(formDatas, service, sessionData, _id);
    req.session.booking.bookingId = result.newBookingId;
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in userBookedCar:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function bookedCars(req, res) {
  try {
    const { data, name, count } = await helper.bookedCarsHelper(req);
    return res.render('user/carsBooked', {
      data: data.user, history: data.history, name, count,
    });
  } catch (error) {
    console.error('Error fetching bookedCar:', error);
    return res.status(500).json({ error: 'Error fetching wishlist', message: error.message });
  }
}

async function removeBookings(req, res) {
  try {
    await helper.removeBookingsHelper(req);
    return res.status(200).redirect('/bookedCars');
  } catch (error) {
    console.error('Error removing booking:', error);
    return res.status(500).json({ error: 'Error removing booking', message: error.message });
  }
}

const userPayRent = async (req, res) => {
  const { bookingId } = req.body;
  res.send(bookingId);
};

const paymentPage = async (req, res) => {
  const {
    bookingId, pickDate, dropDate, id,
  } = req.query;
  req.session.booking = {
    bookingId, pickDate, dropDate, carId: id,
  };

  return res.status(200).redirect('/bookingCar');
};

async function carDetails(req, res) {
  const { _id } = req.session;
  const { bookingId } = req.query;
  try {
    const { thisBooking, service } = await helper.getCarDetails(bookingId, _id);
    return res.status(200).json({ thisBooking, service });
  } catch (error) {
    return res.status(500).json(error);
  }
}

async function paymentVerification(req, res) {
  try {
    const updatedUser = await helper.verifyPaymentAndUpdateUser(req.session, req.body);
    req.session.booking = { pickDate: '', dropDate: '', bookingId: '' };

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Payment verification failed' });
  }
}

async function orderDetails(req, res) {
  try {
    const { bookingId } = req.body;
    const { thisCar, user } = await helper.getOrderDetails(req.session, bookingId);
    res.status(200).json({ thisCar, user });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ error: 'Error fetching order details' });
  }
}
async function review(req, res) {
  const { ...formData } = req.body;

  helper.addReview(req.session._id, formData)
    .then(() => {
      res.status(201).redirect('/bookedCars');
    })
    .catch((error) => {
      console.error(error);
      res.status(201).redirect('/bookedCars');
    });
}
function bookNow(req, res) {
  const { pickDate, dropDate, carId } = req.body;
  req.session.booking = { pickDate, dropDate, carId };
  res.status(200).json('ok');
}
module.exports = {
  getHomePage,
  loginPage,
  userLogin,
  profilePage,
  logoutUser,
  updateUser,
  deleteUser,
  showCars,
  filterCars,
  carDetailsUser,
  generateOtpEmail,
  userOtpCheck,
  registration,
  contactPage,
  userMessageToAdmin,
  aboutPage,
  userRecoveryMessage,
  OtpCheck,
  forgotPassword,
  bookingCar,
  addDate,
  changeDate,
  findCarByDate,
  userBookedCar,
  bookedCars,
  removeBookings,
  userPayRent,
  paymentPage,
  carDetails,
  paymentVerification,
  orderDetails,
  review,
  allCars,
  bookNow,
};
