/* eslint-disable import/no-extraneous-dependencies */
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/userDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({

  email: {
    type: String,
    unique: true,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
});

const admin = mongoose.model('User', userSchema);

module.exports = admin;
