/* eslint-disable arrow-parens */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-else-return */
/* eslint-disable object-shorthand */
/* eslint-disable no-undef */
/* eslint-disable consistent-return */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-shadow */
/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-unused-vars */
// adminRoute.js
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const session = require('express-session');
const path = require('path');

const { admin } = require('../models/users');

const { Vender } = require('../models/users');

const { User } = require('../models/users');
const cloudinary = require('../service/cloudnery');

const { Car } = require('../models/car');
const { upload, uploadFile, deleteFile } = require('../service/fileUpload-delete');
const { sendAdminOtp, generateOtp } = require('../service/nodeMailer');

const emailOtp = {};

const showLoginPageAdmin = (req, res) => {
  res.render('loginPage');
};
async function getAdminDashBoard(req, res) {
  const { email, password } = req.body;
  console.log(email);
  try {
    const bcryptPassword = await bcrypt.hash(password, 10);
    const Admin = await admin.findOne({ email });
    if (Admin && await bcrypt.compare(password, Admin.password)) {
      const adminId = uuidv4();
      req.session.adminId = adminId;
      res.redirect('/admin/DashboardPage');
    } else {
      const error = 'enter valid password and email';
      res.render('loginPage', { error: error });
    }
  } catch (error) {
    res.status(500).json({ error: 'server Error', details: error });
  }
}
async function loginOtp(req, res) {
  const { otp } = req.body;
  const { email } = req.session;
  if (emailOtp[email] && emailOtp[email] === otp) {
    const admin = Car.find({ email: email });
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
  res.render('admin/index');
};
async function showAdminCarPage(req, res) {
  const car = await Car.find();
  const counts = await Car.find().countDocuments();
  res.render('admin/adminCarPage', { data: car, count: counts });
}
const logout = (req, res) => {
  if (req.session.adminId) {
    req.session.destroy((error) => {
      if (error) {
        console.log(error);
      } else {
        res.redirect('/admin/login');
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
    console.log(req.newPath.id);
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

async function deleteCar(req, res) {
  try {
    const deleteId = req.query.deleteCarId;
    if (!deleteId) {
      res.status(400).json('/admin/carPage');
    } else {
      const car = await Car.findById(deleteId);
      const publicIdToDelete = car.imageId;
      cloudinary.deleteImage(publicIdToDelete)
        .then(result => {
          console.log('Image deleted:', result);
        })
        .catch(error => {
          console.error('Error deleting image:', error);
        });
      const result = await Car.findByIdAndDelete(deleteId);
      if (result) {
        res.status(200).redirect('/admin/carPage');
      } else {
        return res.status(404).json('Car not found');
      }
    }
  } catch (error) {
    console.log('Bad Request:', error);
    return res.status(500).send(`Server Error:  ${{ error }}`);
  }
}
function OtpPage(req, res) {
  res.status(200).render('loginOtpPage');
}
function otpGenerate(req, res) {
  const { email } = req.body;
  const otp = generateOtp();
  emailOtp[email] = otp;
  req.session.email = email;
  console.log(req.session.email);
  console.log(otp, email);

  sendAdminOtp(email, otp, (error, info) => {
    if (error) {
      return res.status(500).send(error);
    } else {
      console.log(otp, email);
      req.session.email = email;
      res.status(201).render('generateOtp', { email });
    }
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
          .then(result => {
            console.log('Image deleted:', result);
          })
          .catch(error => {
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
async function findCarCategories(req, res) {
  try {
    const { category } = req.query;
    if (!category) {
      console.log('Bad Request:');
      return res.status(400).send('Server Error:');
    } else {
      const cars = await Car.find({ carCategory: category });
      const carsCount = await Car.find({ carCategory: category }).countDocuments();

      if (cars) {
        res.status(200).render('admin/adminCarPage', { data: cars, count: carsCount, category: category });
      }
    }
  } catch (error) {
    console.log('Bad Request:', error);
    return res.status(500).send(`Server Error:  ${{ error }}`);
  }
}

async function alphabeticallySort(req, res) {
  const { Category, search } = req.query;
  if (Category) {
    if (!search) {
      const cars = await Car.find({ carCategory: Category }).sort({ carName: 1 });
      const count = cars.length;
      res.status(200).render('admin/adminCarPage', { data: cars, count: count, category: Category });
    } else {
      const cars = await Car.find({ carCategory: Category, carName: { $regex: new RegExp(search, 'i') } }).sort({ carName: 1 });
      const count = cars.length;
      res.status(200).render(
        'admin/adminCarPage',
        {
          data: cars, count: count, category: Category, search: search,
        },
      );
    }
  } else if (!search) {
    const cars = await Car.find({}).sort({ carName: 1 });
    const count = cars.length;
    res.status(200).render('admin/adminCarPage', { data: cars, count: count });
  } else {
    const cars = await Car.find({ carName: { $regex: new RegExp(search, 'i') } }).sort({ carName: 1 });
    const count = cars.length;
    res.status(200).render(
      'admin/adminCarPage',
      {
        data: cars, count: count, search: search,
      },
    );
  }
}
async function searchByCarName(req, res) {
  const search = req.query.search;
  const encodedCategory = req.query.category;
  const category = decodeURIComponent(encodedCategory).trim();
  if (category === '') {
    const cars = await Car.find({ carName: { $regex: new RegExp(search, 'i') } }).sort({ carName: 1 });
    const count = cars.length;
    res.status(200).render('admin/adminCarPage', { data: cars, count: count, search: search });
  } else {
    const cars = await Car.find({ carName: { $regex: new RegExp(search, 'i') }, carCategory: category }).sort({ carName: 1 });
    const count = cars.length;
    res.status(200).render(
      'admin/adminCarPage',
      {
        data: cars, count: count, category: category, search: search,
      },
    );
  }
}

const viewNotificationPage = async (req, res) => {
  try {
    const vender = await Vender.aggregate([
      {
        $match: {
          role: 'vender',
          venderAccessEnabled: false,
        },
      },
    ]);
    if (!vender) {
      console.error({ error: 'not found Notification' });
    } else {
      const count = vender.length;
      res.status(200).render('admin/notification', { data: vender, count });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// vender page
async function venderPage(req, res) {
  const venders = await Vender.find({ role: 'vender' });
  res.status(200).render('admin/adminVenderPage', { data: venders });
}

async function venderDetails(req, res) {
  try {
    const { venderId } = req.query;
    const venders = await Vender.findById(venderId);
    res.json(venders);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
async function deleteVender(req, res) {
  try {
    const { deleteVenderId } = req.query;
    if (deleteVenderId) {
      const result = await Vender.findByIdAndDelete(deleteVenderId);
      if (result) {
        res.status(200).redirect('/admin/Vender');
      } else {
        res.status(300).json('not modify');
      }
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function alphabeticallySortVender(req, res) {
  try {
    const vender = await Vender.find({ role: 'vender' }).sort({ name: 1 });
    if (vender) {
      res.status(200).render('admin/adminVenderPage', { data: vender });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
async function searchingVender(req, res) {
  try {
    const { search } = req.body;
    if (search) {
      const vender = await Vender.find({ role: 'vender', name: { $regex: new RegExp(search, 'i') } });
      res.status(200).render('admin/adminVenderPage', { data: vender, search: search });
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
    const user = await User.find({ role: 'user' });
    res.status(200).render('admin/adminUserPage', { data: user });
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
      res.status(200).render('admin/adminUserPage', { data: user, search: search });
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
  const user = await User.findById(deleteUserId);

  if (!user) {
    // Handle case where user with given ID is not found
    res.status(404).send('User not found');
  }

  const loginDate = user.createdAt;
  const toDay = new Date();
  const timeDifference = toDay - loginDate;
  const dayDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  if (dayDifference >= 31) {
    const deleted = await User.findByIdAndDelete(deleteUserId);
    if (deleted) {
      res.redirect('/admin/users');
    }
  } else {
    const error = `could not delete ${user.name} delete must after one month`;
    res.status(304).redirect('/admin/users');
  }
  // Sending the dayDifference as the response
}

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
  venderPage,
  venderDetails,
  deleteVender,
  alphabeticallySortVender,
  searchingVender,
  userPage,
  userDetails,
  alphabeticallySortUser,
  searchingUser,
  deleteUser,
};
