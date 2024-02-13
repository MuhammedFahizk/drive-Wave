/* eslint-disable no-underscore-dangle */
const { v4: uuidv4 } = require('uuid');

// const { admin } = require('../models/users');

const { Vendor } = require('../models/users');

// const { User } = require('../models/users');
const { Car } = require('../models/car');
const cloudinary = require('../service/cloudnery');

const loginPage = (req, res) => {
  res.status(200).render('vendor/login');
};

async function showVendorDashboard(req, res) {
  try {
    const { email, password } = req.body;
    if (email && password) {
      const vendor = await Vendor.findOne({ role: 'vendor', email, password });
      if (vendor) {
        if (!vendor.vendorAccessEnabled === true) {
          res.status(403).render('vendor/login', { error: 'EnterAdmin does not have permission to enable the vendor ' });
        } else {
          req.session.vendorId = uuidv4();
          req.session.ownerId = vendor._id;
          res.status(200).redirect('/vendor/dashboardPage');
        }
      } else {
        res.status(401).render('vendor/login', { error: 'Enter Valid Email And Password' });
      }
    }
  } catch (error) {
    res.status(500).json({ error: 'server Error', details: error });
  }
}
const showDashboard = (req, res) => {
  res.status(200).render('vendor/dashboard');
};

const signUpPage = (req, res) => {
  res.status(200).render('vendor/signUp');
};

const signupVendor = async (req, res) => {
  try {
    const { email } = req.body;

    const existingVendor = await Vendor.findOne({ email });
    if (existingVendor) {
      return res.status(409).render('vendor/signUp', { error: 'Email address is already in use' });
    }
    const newVendor = new Vendor(req.body);
    newVendor.role = 'vendor';
    newVendor.vendorAccessEnabled = false;
    await newVendor.save();
    return res.status(201).render('vendor/login', { popup: 'Successfully Submit Your Data Access after Enable Admin' }); // Respond with the saved Vendor data
  } catch (error) {
    console.error('Error creating Vendor:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

async function vendorCarPage(req, res) {
  try {
    const { ownerId } = req.session;
    if (ownerId) {
      const cars = await Car.find({ ownerId });
      const count = await Car.countDocuments({ ownerId });
      res.status(200).render('vendor/carPage', { data: cars, count });
    } else {
      res.status(500).json({ error: 'not find vendorID' });
    }
  } catch (error) {
    res.status(500).json({ error: 'server Error', details: error });
  }
}
async function addCarVendor(req, res) {
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
    newCar.ownerId = req.session.ownerId;
    newCar.carImage = newPath;
    await newCar.save();
    res.status(201).redirect('/vendor/CarPage');
  } else {
    res.status(400).json({ message: 'No file uploaded' });
  }
}
async function updateCar(req, res) {
  try {
    const { editCarId, imageId, ...updateValues } = req.body;

    if (!editCarId) {
      return res.status(400).json({ error: 'Could not get car Id' });
    }

    const updatedCar = await Car.findByIdAndUpdate(
      editCarId,
      { $set: updateValues },
      { new: true },
    );

    if (!updatedCar) {
      return res.status(404).json({ error: 'Car not found' });
    }

    if (req.file) {
      const car = await Car.findById(editCarId);
      const publicIdToDelete = car.imageId;
      // If a new image is uploaded, delete the old image from Cloudinary
      if (publicIdToDelete) {
        try {
          await cloudinary.deleteImage(publicIdToDelete);
        } catch (error) {
          console.error('Error deleting image:', error);
        }
      }
      updatedCar.carImage = req.newPath.url;
      updatedCar.imageId = req.newPath.id;
    }

    await updatedCar.save();

    return res.status(200).redirect('/vendor/carPage');
  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).send('Server Error');
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
      return res.status(400).json({ error: 'Missing deleteCarId parameter' });
    }

    const car = await Car.findById(deleteId);
    if (!car) {
      return res.status(404).json({ error: 'Car not found' });
    }

    const publicIdToDelete = car.imageId;
    await cloudinary.deleteImage(publicIdToDelete);

    await Car.findByIdAndDelete(deleteId);

    return res.status(200).redirect('/vendor/carPage');
  } catch (error) {
    console.error('Error deleting car:', error);
    return res.status(500).send('Server Error');
  }
}
const vendorLogout = (req, res) => {
  if (req.session.vendorId) {
    req.session.destroy((error) => {
      if (error) {
        res.status(500).redirect('/vendor/Dashboard');
      } else {
        res.status(200).redirect('/vendor/login');
      }
    });
  }
};
module.exports = {
  loginPage,
  showVendorDashboard,
  showDashboard,
  vendorCarPage,
  addCarVendor,
  updateCar,
  getCar,
  deleteCar,
  signUpPage,
  signupVendor,
  vendorLogout,
};
