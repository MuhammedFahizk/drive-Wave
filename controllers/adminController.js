/* eslint-disable no-shadow */
/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-unused-vars */
// adminRoute.js
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const session = require('express-session');

const admin = require('../models/admin');

const showLoginPageAdmin = (req, res) => {
  res.render('loginPage');
};
async function getAdminDashBoard(req, res) {
  const { email, password } = req.body;
  console.log(email);
  try {
    const bcryptPassword = await bcrypt.hash(password, 10);
    const Admin = await admin.findOne({ email });
    console.log(Admin);
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
const showAdminCarPage = (req, res) => {
  res.render('admin/adminCarPage');
};
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
module.exports = {
  showLoginPageAdmin,
  getAdminDashBoard,
  showAdminDashboard,
  showAdminCarPage,
  logout,
};
