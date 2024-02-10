/* eslint-disable no-underscore-dangle */
const { v4: uuidv4 } = require('uuid');

// const { admin } = require('../models/users');

const { Vender } = require('../models/users');

// const { User } = require('../models/users');
const { Car } = require('../models/car');
const cloudinary = require('../service/cloudnery');

const loginPage = (req, res) => {
  res.status(200).render('vender/login');
};

async function showVenderDashboard(req, res) {
  try {
    const { email, password } = req.body;
    if (email && password) {
      const vender = await Vender.findOne({ role: 'vender', email, password });
      if (vender) {
        req.session.venderId = uuidv4();
        req.session.ownerId = vender._id;
        res.status(200).redirect('/vender/dashboardPage');
      } else {
        res.status(401).render('vender/login', { error: 'Enter Valid Email And Password' });
      }
    }
  } catch (error) {
    res.status(500).json({ error: 'server Error', details: error });
  }
}
const showDashboard = (req, res) => {
  res.status(200).render('vender/dashboard');
};
async function venderCarPage(req, res) {
  try {
    const { ownerId } = req.session;
    if (ownerId) {
      const cars = await Car.find({ ownerId });
      const count = await Car.countDocuments({ ownerId });
      res.status(200).render('vender/carPage', { data: cars, count });
    } else {
      res.status(500).json({ error: 'not find venderID' });
    }
  } catch (error) {
    res.status(500).json({ error: 'server Error', details: error });
  }
}
async function addCarVender(req, res) {
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
    newCar.ownerId = req.session.ownerId;
    newCar.carImage = newPath;
    await newCar.save();
    res.status(201).redirect('/vender/CarPage');
  } else {
    res.status(400).json({ message: 'No file uploaded' });
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

    return res.status(200).redirect('/vender/carPage');
  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).send(`Server Error: ${error}`);
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
      res.status(400).json('/vender/carPage');
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
        res.status(200).redirect('/vender/carPage');
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
  loginPage,
  showVenderDashboard,
  showDashboard,
  venderCarPage,
  addCarVender,
  updateCar,
  getCar,
  deleteCar,
};
