/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/* eslint-disable import/order */
/* eslint-disable import/no-useless-path-segments */
/* eslint-disable no-return-await */
const cloudinary = require('../service/cloudnery');
const fs = require('fs');

const loginMiddleWare = (req, res, next) => {
  if (req.session.vendorId) {
    res.redirect('/vendor/dashboardPage');
  } else {
    next();
  }
};
const requireAuth = (req, res, next) => {
  if (req.session.vendorId) {
    next();
  } else {
    res.redirect('/vendor/login');
  }
};

async function addImage(req, res, next) {
  const uploader = async (path) => await cloudinary.uploads(path, 'carImages');

  try {
    const { file } = req;
    if (file) {
      const { path } = file;
      const newPath = await uploader(path);
      fs.unlinkSync(path);
      req.newPath = newPath; // Store newPath in the request object for later use
    }
    next(); // Move to the next middleware or route handler
  } catch (error) {
    console.error(error);
    res.status(500).json('error for file uploading');
  }
}

module.exports = {
  loginMiddleWare,
  requireAuth,
  addImage,
};
