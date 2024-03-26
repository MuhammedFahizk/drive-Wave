const fs = require('fs');
const cloudinary = require('../service/cloudnery');

const loginMiddleWare = (req, res, next) => {
  if (req.session.adminId) {
    res.redirect('/admin/DashboardPage');
  } else {
    next();
  }
};
const requireAuth = (req, res, next) => {
  if (req.session.adminId) {
    next();
  } else {
    res.redirect('/admin/login');
  }
};

async function addImage(req, res, next) {
  const uploader = async (path) => cloudinary.uploads(path, 'carImages');
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

async function serviceImage(req, res, next) {
  const uploader = async (path) => cloudinary.uploads(path, 'Service');
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
  serviceImage,
};
