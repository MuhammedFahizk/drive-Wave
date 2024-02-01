/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
const loginMiddleWare = (req, res, next) => {
  if (req.session.adminId) {
    res.redirect('/adminDashboardPage');
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
module.exports = {
  loginMiddleWare,
  requireAuth,
};
