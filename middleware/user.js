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

const mustLogin = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    const { originalUrl } = req;
    req.session.originalUrl = originalUrl;
    res.redirect('/login');
  }
};
module.exports = {
  loginMiddleWare,
  requireAuth,
  mustLogin,
};
