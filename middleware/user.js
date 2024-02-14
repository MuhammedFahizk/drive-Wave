const loginMiddleWare = (req, res, next) => {
  if (req.session.userId) {
    res.redirect('/');
  } else {
    next();
  }
};
const requireAuth = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.redirect('/');
  }
};

const LoginUser = (req, res, next) => {
  if (req.session.userId) {
    const { carId, pickDate, dropDate } = req.query;
    req.session.carId = carId;
    req.session.pickDate = pickDate;
    req.session.dropDate = dropDate;
    next();
  } else {
    const { carId, pickDate, dropDate } = req.query;
    req.session.previous = 'carBooking';
    req.session.carId = carId;
    req.session.pickDate = pickDate;
    req.session.dropDate = dropDate;

    res.status(401).redirect('/login');
  }
};
const LoginUserPost = async (req, res, next) => {
  if (req.session.userId) {
    const { carId, pickDate, dropDate } = req.body;
    req.session.carId = carId;
    req.session.pickDate = pickDate;
    req.session.dropDate = dropDate;
    next();
  } else {
    const { carId, pickDate, dropDate } = req.body;

    req.session.previous = 'carBooking';
    req.session.carId = carId;
    req.session.pickDate = pickDate;
    req.session.dropDate = dropDate;
    res.status(401).redirect('/login');
  }
};
module.exports = {
  loginMiddleWare,
  requireAuth,
  LoginUser,
  LoginUserPost,
};
