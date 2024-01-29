/* eslint-disable no-console */
/* eslint-disable prefer-const */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable eol-last */
const multer = require('multer');
// const fs = require('fs');
const path = require('path');

// const upload = multer({ dest: 'Uploads/' });

const storages = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    let ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

const upload = multer({
  storage: storages,
  fileFilter: (req, file, callback) => {
    const allowedFormats = ['image/png', 'image/jpeg'];
    if (allowedFormats.includes(file.mimetype)) {
      callback(null, true);
    } else {
      console.log('Only jpg, png files are allowed');
      callback(null, false);
    }
  },
});

const uploadFile = (req, res) => {
  if (req.file) {
    console.log('File uploaded successfully!');
    res.status(201).redirect('/adminCarPage');
  } else {
    console.log('Error uploading file!');
  }
};

module.exports = { upload, uploadFile };
