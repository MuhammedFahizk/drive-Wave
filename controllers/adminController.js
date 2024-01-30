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

const admin = require('../models/admin');
const AddCar = require('../models/car');
const { upload, uploadFile } = require('../service/fileUpload-delete');

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
      res.redirect('/adminDashboardPage');
    } else {
      res.send('no');
    }
  } catch (error) {
    res.status(500).json({ error: 'server Error', details: error });
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
module.exports = {
  showLoginPageAdmin,
  getAdminDashBoard,
  showAdminDashboard,
  showAdminCarPage,
  logout,
  addCarAdmin,
  getCar,
  deleteCar,
};
