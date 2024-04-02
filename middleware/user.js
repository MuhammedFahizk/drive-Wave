const loginMiddleWare = (req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  if (req.session.userId) {
    return res.redirect('/');
  }

  return next();
};
const requireAuth = (req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  if (!req.session.userId) {
    return res.redirect('/');
  }
  return next();
};

const auth = (req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
};
const mustLogin = (req, res, next) => {
  if (req.session.userId) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
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
  auth,
};
