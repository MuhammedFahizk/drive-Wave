/* eslint-disable no-unused-vars */
const { User } = require('../models/users');

const getHomePage = (req, res) => {
  res.render('user/index');
};
const loginPage = (req, res) => {
  res.render('user/login');
};
async function register(req, res) {
  res.render('user/signUp');
}
module.exports = {
  getHomePage,
  loginPage,
  register,
};
