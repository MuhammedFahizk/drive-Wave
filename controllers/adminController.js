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

const { admin, Vender } = require('../models/admin');
const AddCar = require('../models/car');
const { upload, uploadFile, deleteFile } = require('../service/fileUpload-delete');
const { sendAdminOtp, generateOtp } = require('../service/otp');

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
      req.session.email = email;
      res.redirect('/adminDashboardPage');
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
    const admin = AddCar.find({ email: email });
    if (admin) {
      delete emailOtp[email];
      const adminId = uuidv4();
      req.session.adminId = adminId;
      res.redirect('/adminDashboardPage');
    } else {
      res.status(404).redirect('/login');
    }
  }
}
const showAdminDashboard = (req, res) => {
  res.render('admin/index');
};
async function showAdminCarPage(req, res) {
  const car = await AddCar.find();
  const counts = await AddCar.find().countDocuments();
  res.render('admin/adminCarPage', { data: car, count: counts });
}
const logout = (req, res) => {
  if (req.session.adminId) {
    req.session.destroy((error) => {
      if (error) {
        console.log(error);
      } else {
        res.redirect('/login');
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
    brandName,
    carModal,
    licensePlateNumber,
    color,
    fuelType,
    TransmitionType,
    milage,
    insurenceDate,
    feathers,
    description,
  } = req.body;
  if (req.file && req.file.path) {
    const newCar = new AddCar({
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
      insurenceDate,
      feathers,
      description,
    });
    newCar.carImage = req.file.path;
    await newCar.save();
    uploadFile(req, res);
  }
}
async function getCar(req, res) {
  try {
    const carId = req.query.carId;
    const carDetails = await AddCar.findById(carId);

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
      res.status(400).json('/adminCarPage');
    } else {
      const result = await AddCar.findByIdAndDelete(deleteId);
      if (result) {
        res.status(200).redirect('/adminCarPage');
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
    const carDetails = AddCar.findById(editId);
    res.status(200).json(carDetails);
  } else {
    res.status(400).json('error');
  }
}
async function updateCar(req, res) {
  try {
    const { editCarId, carImage, ...updateValues } = req.body;
    if (!editCarId) {
      res.status(400).json('Could not get car Id');
    } else {
      const updateCar = await AddCar.findByIdAndUpdate(
        editCarId,
        { $set: updateValues },
        { new: true },
      );
      const car = await AddCar.findById(editCarId).exec();
      if (req.file) {
        await deleteFile(car.carImage);
        updateCar.carImage = req.file.path;
        await updateCar.save();
        uploadFile(req, res);
      } else {
        await updateCar.save();
        res.status(200).redirect('/adminCarPage');
      }
    }
  } catch (error) {
    console.log('Bad Request:', error);
    return res.status(500).send(`Server Error:  ${{ error }}`);
  }
}
async function findCarCategories(req, res) {
  try {
    const { category } = req.query;
    if (!category) {
      console.log('Bad Request:');
      return res.status(400).send('Server Error:');
    } else {
      const cars = await AddCar.find({ carCategory: category });
      const carsCount = await AddCar.find({ carCategory: category }).countDocuments();

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
      const cars = await AddCar.find({ carCategory: Category }).sort({ carName: 1 });
      const count = cars.length;
      res.status(200).render('admin/adminCarPage', { data: cars, count: count, category: Category });
    } else {
      const cars = await AddCar.find({ carCategory: Category, carName: { $regex: new RegExp(search, 'i') } }).sort({ carName: 1 });
      const count = cars.length;
      res.status(200).render(
        'admin/adminCarPage',
        {
          data: cars, count: count, category: Category, search: search,
        },
      );
    }
  } else if (!search) {
    const cars = await AddCar.find({}).sort({ carName: 1 });
    const count = cars.length;
    res.status(200).render('admin/adminCarPage', { data: cars, count: count });
  } else {
    const cars = await AddCar.find({ carName: { $regex: new RegExp(search, 'i') } }).sort({ carName: 1 });
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
    const cars = await AddCar.find({ carName: { $regex: new RegExp(search, 'i') } }).sort({ carName: 1 });
    const count = cars.length;
    res.status(200).render('admin/adminCarPage', { data: cars, count: count, search: search });
  } else {
    const cars = await AddCar.find({ carName: { $regex: new RegExp(search, 'i') }, carCategory: category }).sort({ carName: 1 });
    const count = cars.length;
    res.status(200).render(
      'admin/adminCarPage',
      {
        data: cars, count: count, category: category, search: search,
      },
    );
  }
}
// vender page
async function venderPage(req, res) {
  const venders = await Vender.find({ role: 'vender' });
  console.log(venders);
  res.status(200).render('admin/adminVenderPage', { data: venders });
}

async function venderDetails(req, res) {
  try {
    const { venderId } = req.query;
    console.log(req.query);
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
        res.status(200).redirect('/adminVender');
      } else {
        res.status(300).json('not modify');
      }
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
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
  venderPage,
  venderDetails,
  deleteVender,
};
