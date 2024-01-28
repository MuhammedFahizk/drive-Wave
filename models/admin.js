/* eslint-disable import/no-extraneous-dependencies */
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

mongoose.connect('mongodb://localhost:27017/userDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = mongoose.Schema({
  userName: {
    type: String,
    unique: true,
    require: true,
  },
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

// eslint-disable-next-line consistent-return
userSchema.pre('save', function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = bcrypt.hashSync(this.password, 10);
});

userSchema.methods.comparePassword = function (plainText, callback) {
  return callback(null, bcrypt.compareSync(plainText, this.password));
};

const userModel = mongoose.model('user', userSchema);

module.exports = userModel;
