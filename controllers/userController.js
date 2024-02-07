/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/order */
/* eslint-disable indent */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
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
  const newUser = new User({
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
    phone: code + phone,
    role: 'user',
  });
  newUser.role = 'user';
  await newUser.save();
  req.session.name = name;
  req.session.password = password;
  req.session.userId = uuidv4();
  res.redirect('/');
  } catch (error) {
    res.status(500).json({ error: 'server Error', details: error });
  }
}
async function userLogin(req, res) {
  const { name, password } = req.body;
  if (name && password) {
    const user = await User.findOne({ name, password });
    if (user) {
        req.session.userId = uuidv4();
        req.session.name = name;
        req.session.password = password;
        res.redirect('/');
    } else {
        res.status(404).render('user/login', { error: 'user name or password is invalid  ' });
    }
  }
}
async function profilePage(req, res) {
  try {
    if (req.session) {
    const { name, password } = req.session;
    const user = await User.findOne({ name, password });
    const address = user.address[0];
        if (user) {
    res.status(200).render('user/profile', { data: user, name, address });
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
      code,
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
 res.status(200).redirect('/profile');
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
  const cars = await Car.find();
  if (cars) {
    cars.carImageUrl = encodeURIComponent(cars.carImage);
    res.render('user/cars', { data: cars });
  }
  } catch (error) {
  console.error('Error deleting user', error);
  res.status(500).json('Internal Server Error');
}
}

async function filterCars(req, res) {
  const { transmission, fuel } = req.body;
  const model = [
    {
      $match: {
        TransmitionType: { $in: transmission }, // Convert to single value
        fuelType: { $in: fuel },
      },
    },
  ];
  const allCollections = await Car.aggregate(model);
   res.status(200).json(allCollections);
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
};
