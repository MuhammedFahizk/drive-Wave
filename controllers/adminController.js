/* eslint-disable no-underscore-dangle */
/* eslint-disable import/order */
/* eslint-disable no-shadow */
/* eslint-disable import/no-extraneous-dependencies */
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const { admin } = require('../models/users');

const { Vendor } = require('../models/users');

const { User } = require('../models/users');
const cloudinary = require('../service/cloudnery');

const { Car } = require('../models/car');
const { sendAdminOtp, generateOtp, sendmailVendor } = require('../service/nodeMailer');
const adminService = require('../service/adminService');
const { error } = require('console');

const emailOtp = {};
let NotificationCount = 0;

const showLoginPageAdmin = (req, res) => {
  res.render('loginPage');
};
async function getAdminDashBoard(req, res) {
  const { email, password } = req.body;
  try {
    const Admin = await admin.findOne({ role: 'Admin', email });
    if (Admin && await bcrypt.compare(password, Admin.password)) {
      const adminId = uuidv4();
      req.session.adminId = adminId;
      res.redirect('/admin/DashboardPage');
    } else {
      const error = 'enter valid password and email';
      res.render('loginPage', { error });
    }
  } catch (error) {
    res.status(500).json({ error: 'server Error', details: error });
  }
}
async function loginOtp(req, res) {
  const { otp } = req.body;
  const { email } = req.session;
  if (emailOtp[email] && emailOtp[email] === otp) {
    const admin = Car.find({ email });
    if (admin) {
      delete emailOtp[email];
      const adminId = uuidv4();
      req.session.adminId = adminId;
      res.redirect('/admin/DashboardPage');
    } else {
      res.status(404).redirect('admin/login');
    }
  }
}
const showAdminDashboard = (req, res) => {
  res.render('admin/index', { NotificationCount });
};
async function showAdminCarPage(req, res) {
  const car = await Car.find();
  const counts = await Car.find().countDocuments();
  res.render('admin/adminCarPage', { data: car, count: counts, NotificationCount });
}
const logout = (req, res) => {
  if (req.session.adminId) {
    req.session.destroy((error) => {
      if (error) {
        res.status(401).json('email error');
      } else {
        res.status(200).redirect('/admin/login');
      }
    });
  }
};

async function addCarAdmin(req, res) {
  const {
    carName,
    carCategory,
    year,
    brand,
    dayRent,
    seats,
    luggage,
    brandName,
    carModal,
    licensePlateNumber,
    color,
    location,
    fuelType,
    TransmitionType,
    milage,
    insurenceDate,
    features,
    description,
  } = req.body;
  if (req.file && req.file.path) {
    const newCar = new Car({
      carName,
      carCategory,
      year,
      brand,
      dayRent,
      brandName,
      carModal,
      licensePlateNumber,
      color,
      location,
      fuelType,
      TransmitionType,
      milage,
      luggage,
      seats,
      insurenceDate,
      features,
      description,
    });

    const newPath = req.newPath.url;
    newCar.imageId = req.newPath.id;
    newCar.carImage = newPath;
    await newCar.save();
    res.status(201).redirect('/admin/CarPage');
  } else {
    res.status(400).json({ message: 'No file uploaded' });
  }
}
async function getCar(req, res) {
  try {
    const { carId } = req.query;
    const carDetails = await Car.findById(carId);

    res.json(carDetails);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

const deleteCar = async (req, res) => {
  try {
    const deleteId = req.query.deleteCarId;
    if (!deleteId) {
      return res.status(400).json('/admin/carPage');
    }
    const car = await Car.findById(deleteId);
    const publicIdToDelete = car.imageId;
    cloudinary.deleteImage(publicIdToDelete)
      .then((result) => {
        res.json('Image deleted:', result);
      })
      .catch((error) => {
        console.error('Error deleting image:', error);
      });
    const result = await Car.findByIdAndDelete(deleteId);
    if (!result) {
      return res.status(404).json('Car not found');
    }
    return res.status(200).redirect('/admin/carPage');
  } catch (error) {
    return res.status(500).send(`Server Error:  ${{ error }}`);
  }
};
function OtpPage(req, res) {
  res.status(200).render('loginOtpPage');
}
function otpGenerate(req, res) {
  const { email } = req.body;
  const otp = generateOtp();
  emailOtp[email] = otp;
  req.session.email = email;

  sendAdminOtp(email, otp, (error, info) => {
    if (error) {
      return res.status(500).send(error, info);
    }
    console.error(otp, email);
    req.session.email = email;
    return res.status(201).render('generateOtp', { email });
  });
}
async function getCarDetails(req, res) {
  const editId = req.query.carId;
  if (editId) {
    const carDetails = Car.findById(editId);
    res.status(200).json(carDetails);
  } else {
    res.status(400).json('error');
  }
}
async function updateCar(req, res) {
  try {
    const { editCarId, imageId, ...updateValues } = req.body;

    if (!editCarId) {
      return res.status(400).json('Could not get car Id');
    }

    const updatedCar = await Car.findByIdAndUpdate(
      editCarId,
      { $set: updateValues },
      { new: true },
    );

    if (!updatedCar) {
      return res.status(404).json('Car not found');
    }

    if (req.file) {
      const car = await Car.findById(editCarId);
      const publicIdToDelete = car.imageId;
      // If a new image is uploaded, delete the old image from Cloudinary
      if (publicIdToDelete) {
        cloudinary.deleteImage(publicIdToDelete)
          .then((result) => {
            console.error('Image deleted:', result);
          })
          .catch((error) => {
            console.error('Error deleting image:', error);
          });
      }
      updatedCar.carImage = req.newPath.url;
      updatedCar.imageId = req.newPath.id;
    }

    await updatedCar.save();

    return res.status(200).redirect('/admin/carPage');
  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).send(`Server Error: ${error}`);
  }
}
const findCarCategories = async (req, res) => {
  try {
    const { category } = req.query;

    // Check if category is provided
    if (!category) {
      console.error('Bad Request: Category parameter is missing');
      return res.status(400).send('Bad Request: Category parameter is missing');
    }

    // Find cars based on category
    const cars = await Car.find({ carCategory: category });

    // Count the number of cars found
    const carsCount = cars.length;

    // Check if cars are found
    if (carsCount === 0) {
      console.warn('No cars found for the provided category');
      // Optionally handle the case where no cars are found
    }

    // Render the admin car page with data
    return res.status(200).render('admin/adminCarPage', {
      data: cars,
      count: carsCount,
      category,
      NotificationCount, // Assuming NotificationCount is defined somewhere
    });
  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).send(`Server Error: ${error.message}`);
  }
};

async function alphabeticallySort(req, res) {
  const { Category, search } = req.query;
  if (Category) {
    if (!search) {
      const cars = await Car.find({ carCategory: Category }).sort({ carName: 1 });
      const count = cars.length;
      res.status(200).render('admin/adminCarPage', {
        data: cars, count, category: Category, NotificationCount,
      });
    } else {
      const cars = await Car.find({ carCategory: Category, carName: { $regex: new RegExp(search, 'i') } }).sort({ carName: 1 });
      const count = cars.length;
      res.status(200).render(
        'admin/adminCarPage',
        {
          data: cars, count, category: Category, search, NotificationCount,
        },
      );
    }
  } else if (!search) {
    const cars = await Car.find({}).sort({ carName: 1 });
    const count = cars.length;
    res.status(200).render('admin/adminCarPage', { data: cars, count, NotificationCount });
  } else {
    const cars = await Car.find({ carName: { $regex: new RegExp(search, 'i') } }).sort({ carName: 1 });
    const count = cars.length;
    res.status(200).render(
      'admin/adminCarPage',
      {
        data: cars, count, search, NotificationCount,
      },
    );
  }
}
async function searchByCarName(req, res) {
  const { search } = req.query;
  const encodedCategory = req.query.category;
  const category = decodeURIComponent(encodedCategory).trim();
  if (category === '') {
    const cars = await Car.find({ carName: { $regex: new RegExp(search, 'i') } }).sort({ carName: 1 });
    const count = cars.length;
    res.status(200).render('admin/adminCarPage', { data: cars, count, search });
  } else {
    const cars = await Car.find({ carName: { $regex: new RegExp(search, 'i') }, carCategory: category }).sort({ carName: 1 });
    const count = cars.length;
    res.status(200).render(
      'admin/adminCarPage',
      {
        data: cars, count, category, search, NotificationCount,
      },
    );
  }
}

const viewNotificationPage = async (req, res) => {
  try {
    const vendor = await Vendor.aggregate([
      {
        $match: {
          role: 'vendor',
          vendorAccessEnabled: false,
        },
      },
    ]);
    if (!vendor) {
      console.error({ error: 'not found Notification' });
    }
    const count = vendor.length;
    NotificationCount = count;
    const adminDoc = await admin.findOne({ role: 'Admin' }).populate({
      path: 'notifications.userId',
      select: 'name email phone',
    });
    const venderDoc = await admin.findOne({ role: 'Admin' }).populate({
      path: 'notifications.venderId',
      select: 'name email phone',
    });
    return res.status(200).render('admin/notification', {
      data: vendor, count, NotificationCount, adminDoc, venderDoc,
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const disableVendor = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(401).send('not find Id');
    }
    const vendor = await Vendor.findById(id);
    if (!vendor) {
      return res.status(401).send('not find vender');
    }
    const { email } = vendor;
    const message = `${vendor.name}Sorry Admin Not Accept Your Vendor Application`;
    const subject = 'Disable';
    sendmailVendor(email, message, subject, (error, (info) => {
      if (error) {
        return res.status(500).send(error, info);
      }
      return res.status(200).json('Disable the Vendor');
    }));
    const result = await Vendor.deleteOne({ _id: id });
    if (!result) {
      return res.status(404).json({ error: 'vendor Deleting Error' });
    }
    return res.status(200).redirect('/admin/notification', { NotificationCount });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const enableVendor = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(404).json('Could not find vendor id');
    }
    const vendor = await Vendor.findById(id);
    const vendorUpdate = await Vendor.updateOne({ _id: id }, { vendorAccessEnabled: true });
    if (!vendorUpdate) {
      return res.status(404).json('Could not find vendor');
    }
    const { email } = vendor;
    const message = `${vendor.name} Welcome To Drive Wave Admin. You can allow your vendor account <a href="http://localhost:5000/vendor/login">Login</a>`;
    const subject = 'Enable';
    sendmailVendor(email, message, subject, (error, info) => {
      if (error) {
        return res.status(500).send(error, info);
      }
      return res.status(200).json('Disable the Vendor');
    });

    return res.status(200).redirect('/admin/notification');
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const BookingPage = async (req, res) => {
  try {
    const userWithBookings = await User.find({}).populate('bookedCar.car');
    const allBookings = userWithBookings.flatMap((user) => user.bookedCar.map((booking) => {
      const { pickupDate, returnDate } = booking;
      const totalDays = Math.ceil((new Date(returnDate) - new Date(pickupDate))
      / (1000 * 60 * 60 * 24));
      return {
        user,
        userId: user._id,
        userName: user.name,
        bookingDetails: {
          bookingDate: booking.bookingDate.toLocaleDateString(),
          pickupDate: new Date(pickupDate).toLocaleDateString(),
          returnDate: new Date(returnDate).toLocaleDateString(),
          totalDays,
          totalPrice: booking.totalPrice,
          status: booking.status,
          _id: booking._id,
        },
        car: booking.car,
      };
    }));
    const bookingsCount = allBookings.length;
    const confirmedBookingsCount = allBookings.filter((booking) => booking.bookingDetails.status === 'Confirmed').length;
    const pendingBookingsCount = allBookings.filter((booking) => booking.bookingDetails.status === 'pending').length;

    res.status(200).render('admin/bookingPage', {
      allBookings, bookingsCount, pendingBookingsCount, confirmedBookingsCount,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const payment = async (req, res) => {
  try {
    const customers = await adminService.customers();
    const dailyRents = adminService.dailyRents();
    const dailyRentalAmount = await adminService.dailyRentalAmount();
    const dailyRentalPending = await adminService.dailyRentalAmountPending();
    return res.status(200).render('admin/payment', {
      customers, dailyRents, dailyRentalAmount, dailyRentalPending,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send('internal server error');
  }
};

// vendor page
async function vendorPage(req, res) {
  const vendors = await Vendor.find({ role: 'vendor', deletedAt: null });
  const count = await Vendor.find({ role: 'vendor', deletedAt: null }).countDocuments();

  res.status(200).render('admin/adminVendorPage', { data: vendors, NotificationCount, count });
}

async function vendorDetails(req, res) {
  try {
    const { vendorId } = req.query;
    const vendors = await Vendor.findById(vendorId);
    res.json(vendors);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
async function deleteVendor(req, res) {
  try {
    const { deleteVenderId } = req.query;
    const vendor = await Vendor.findByIdAndUpdate(deleteVenderId, { deletedAt: new Date() });
    const notification = {
      venderId: vendor._id,
      message: `Vendor ${vendor.name} has been deleted.`,
      sender: 'System', // You can set the sender as needed
      createdAt: new Date(),
    };
    // Push the notification to the notifications array
    vendor.notifications.push(notification);
    await vendor.save();

    if (!vendor) {
      // Handle case where user with given ID is not found
      res.status(404).json('User not found');
    }
    res.status(200).json('status : ok');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function alphabeticallySortVendor(req, res) {
  try {
    const vendor = await Vendor.find({ role: 'vendor' }).sort({ name: 1 });
    if (vendor) {
      res.status(200).render('admin/adminVendorPage', { data: vendor, NotificationCount });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
async function searchingVendor(req, res) {
  try {
    const { search } = req.body;
    if (search) {
      const vendor = await Vendor.find({ role: 'vendor', name: { $regex: new RegExp(search, 'i') } });
      res.status(200).render('admin/adminVendorPage', { data: vendor, search, NotificationCount });
    } else {
      res.status(204).json('no search content');
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// user page ,
async function userPage(req, res) {
  try {
    const user = await User.find({ role: 'user', deletedAt: null });
    const count = await User.find({ role: 'user', deletedAt: null }).countDocuments();

    res.status(200).render('admin/adminUserPage', { data: user, NotificationCount, count });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
async function userDetails(req, res) {
  try {
    const { UserId } = req.query;
    const user = await User.findById(UserId);
    res.status(200).json(user);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function alphabeticallySortUser(req, res) {
  try {
    const user = await User.find({ role: 'user' }).sort({ name: 1 });
    if (user) {
      res.status(200).render('admin/adminUserPage', { data: user });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function searchingUser(req, res) {
  try {
    const { search } = req.body;
    if (search) {
      const user = await User.find({ role: 'user', name: { $regex: new RegExp(search, 'i') } });
      res.status(200).render('admin/adminUserPage', { data: user, search, NotificationCount });
    } else {
      res.status(204).json('no search content');
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
async function deleteUser(req, res) {
  const { deleteUserId } = req.query;
  const user = await User.findByIdAndUpdate(deleteUserId, { deletedAt: new Date() });
  res.status(200).json('status : ok');

  if (!user) {
    // Handle case where user with given ID is not found
    res.status(404).json('User not found');
  }
}

const deleteUserData = async (req, res) => {
  const { id } = req.query;
  const adminDoc = await admin.findOneAndUpdate(
    { role: 'Admin' },
    { $pull: { notifications: { _id: id } } },
    { new: true },
  );

  if (!adminDoc) {
    return res.status(404).send('Admin not found');
  }
  return res.status(200).redirect('/admin/Notification');
};

async function cleanupSoftDeletedData() {
  try {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    // Remove soft-deleted users older than one month
    await User.deleteMany({ deletedAt: { $lt: oneMonthAgo } });

    // Remove soft-deleted vendors older than one month
    await Vendor.deleteMany({ deletedAt: { $lt: oneMonthAgo } });

    console.error('Soft-deleted data older than one month cleaned up successfully');
  } catch (error) {
    console.error('Error cleaning up soft-deleted data:', error);
  }
}

const deleteCancelUser = async (req, res) => {
  const {
    id, userId, venderId, notificationId,
  } = req.query;
  const adminDoc = await admin.findOneAndUpdate(
    { role: 'Admin' },
    { $pull: { notifications: { _id: id } } },
    { new: true },
  );
  if (venderId) {
    const venderDoc = await Vendor.findOneAndUpdate(
      { _id: venderId },
      { $unset: { deletedAt: '' }, $pull: { notifications: { _id: notificationId } } },
      { new: true },
    );
    if (!venderDoc) {
      return res.status(404).send('Vender  not found');
    }

    return res.status(200).redirect('/admin/Notification');
  }
  const userDoc = await User.findOneAndUpdate(
    { _id: userId },
    { $unset: { deletedAt: '' } },
    { new: true },
  );

  if (!userDoc) {
    return res.status(404).send('User not found');
  }

  if (!adminDoc) {
    return res.status(404).send('Admin not found');
  }
  return res.status(200).redirect('/admin/Notification');
};
// Schedule the cleanup task to run periodically, for example, once a day
setInterval(cleanupSoftDeletedData, 24 * 60 * 60 * 1000);

module.exports = {
  showLoginPageAdmin,
  loginOtp,
  getAdminDashBoard,
  showAdminDashboard,
  showAdminCarPage,
  logout,
  addCarAdmin,
  getCar,
  deleteCar,
  OtpPage,
  otpGenerate,
  getCarDetails,
  updateCar,
  findCarCategories,
  alphabeticallySort,
  searchByCarName,
  viewNotificationPage,
  disableVendor,
  enableVendor,
  BookingPage,
  payment,
  // vendor
  vendorPage,
  vendorDetails,
  deleteVendor,
  alphabeticallySortVendor,
  searchingVendor,
  // user
  userPage,
  userDetails,
  alphabeticallySortUser,
  searchingUser,
  deleteUser,
  deleteUserData,
  deleteCancelUser,
};
