/* eslint-disable no-underscore-dangle */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/order */
/* eslint-disable indent */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const { User } = require('../models/users');
const { Car } = require('../models/car');

const { v4: uuidv4 } = require('uuid');

const getHomePage = (req, res) => {
  if (req.session.name) {
    const { name } = req.session;
     res.render('user/index', { name });
  } else {
    res.render('user/index');
  }
};
const loginPage = (req, res) => {
  res.render('user/login');
};
function register(req, res) {
  res.render('user/signUp');
}
async function userRegistration(req, res) {
  try {
    const {
    name,
    age,
    password,
    email,
    code,
    phone,
    houseName,
    zip,
    place,
    licenseNumber,
  } = req.body;
  const hashPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    name,
    age,
    password: hashPassword,
    email,
    phone,
    licenseNumber,
    address: {
      place,
      zip,
      houseName,
    },
    role: 'user',
  });
  newUser.role = 'user';
  await newUser.save();
  req.session.name = name;
  req.session.password = hashPassword;
  req.session.userId = uuidv4();
  res.redirect('/');
  } catch (error) {
    res.status(500).json({ error: 'server Error', details: error });
  }
}

async function userLogin(req, res) {
  const { name, password } = req.body;
  if (name && password) {
    try {
      const user = await User.findOne({ name });

      if (user) {
        // Compare hashed password
        const passwordMatch = bcrypt.compare(password, user.password);

        if (passwordMatch) {
            const hashPassword = await bcrypt.hash(password, 10);

          req.session.password = hashPassword;
          req.session.name = user.name;
          req.session.userId = uuidv4();
          // Avoid storing password in session
          // req.session.password = password;
          res.redirect('/');
        } else {
          res.status(404).render('user/login', { error: 'User name or password is invalid' });
        }
      } else {
        res.status(404).render('user/login', { error: 'User name or password is invalid' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server Error' });
    }
  } else {
    res.status(400).render('user/login', { error: 'Missing user name or password' });
  }
}

async function profilePage(req, res) {
  try {
    if (req.session) {
      const { name, password } = req.session;
      console.log(req.session);
      const user = await User.findOne({ name });

        if (user) {
            // Compare hashed password
            const passwordMatch = bcrypt.compare(password, user.password);
            if (passwordMatch) {
                const address = user.address[0];
                res.status(200).render('user/profile', { data: user, name, address });
            } else {
              res.status(404).render('user/login', { error: 'User name or password is invalid' });
            }
    }
    } else {
      res.status(400).redirect('/');
    }
  } catch (error) {
    res.status(500).json({ error: 'server Error', details: error });
  }
}
async function logoutUser(req, res) {
  try {
    if (req.session.userId) {
        req.session.destroy((error) => {
          if (error) {
            console.log(error);
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
    const updateValues = ({
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
    });
 if (editId && updateValues) {
  const update = await User.findByIdAndUpdate(
    editId,
    { $set: updateValues },
    { $new: true },
  );
  req.session.name = name;
  console.log(update);
 }
 res.status(200).redirect('/profile', { name });
} catch {
  res.status(500).json({ error: 'server Error' });
}
}
async function deleteUser(req, res) {
  const { deleteId } = req.query;
  try {
    if (deleteId) {
      const deleteUserById = await User.findByIdAndDelete(deleteId);
      if (deleteUserById) {
        req.session.userId = '';
        req.session.name = '';
        req.session.password = '';
        res.status(200).redirect('/');
      } else {
        res.status(404).json('User not found');
      }
    } else {
      res.status(400).json('Missing deleteId parameter');
    }
  } catch (error) {
    console.error('Error deleting user', error);
    res.status(500).json('Internal Server Error');
  }
}
async function showCars(req, res) {
  try {
    const { name, password } = req.session;
  const cars = await Car.find();
  if (cars) {
    cars.carImageUrl = encodeURIComponent(cars.carImage);
    res.render('user/cars', { data: cars, name });
  }
  } catch (error) {
  console.error('Error deleting user', error);
  res.status(500).json('Internal Server Error');
}
}

async function filterCars(req, res) {
  const {
    transmission,
    fuel,
  carCategory,
} = req.body;
  const model = [
    {
      $match: {
        TransmitionType: { $in: transmission }, // Convert to single value
        fuelType: { $in: fuel },
        carCategory: { $in: carCategory },
      },
    },
  ];
  const allCollections = await Car.aggregate(model);
   res.status(200).json(allCollections);
}

async function carDetailsUser(req, res) {
  const { name, password } = req.session;
  try {
    const { id } = req.query;
    const cars = await Car.findById(id);
    const { fuelType, carCategory } = cars;
    let carData = await Car.aggregate([
      {
        $match:
          {
            $or:
             [
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
    res.status(200).render('user/carDetails', { car: cars, data: carData, name });
  } catch (error) {
    console.error('Error Details User', error);
    res.status(500).json('Internal Server Error');
  }
}

async function carSearchByName(req, res) {
  try {
    const { searchText } = req.body;
     // console.log(searchText);
    if (searchText) {
      const car = await Car.find({ carName: { $regex: new RegExp(searchText, 'i') } });
      res.status(200).json(car);
    }
} catch (error) {
  console.error('Error search car', error);
  res.status(500).json('Internal Server Error');
}
}
module.exports = {
  getHomePage,
  loginPage,
  register,
  userRegistration,
  userLogin,
  profilePage,
  logoutUser,
  updateUser,
  deleteUser,
  showCars,
  filterCars,
  carDetailsUser,
  carSearchByName,
};
