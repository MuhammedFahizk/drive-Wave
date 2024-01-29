const express = require('express');
const adminController = require('../controllers/adminController');
const login = require('../middleware/admin');

const router = express.Router();

router.get('/', login.loginMiddleWare, adminController.showLoginPageAdmin);
router.get('/login', login.loginMiddleWare, adminController.showLoginPageAdmin);
router.post('/adminDashboard', adminController.getAdminDashBoard);
router.get('/adminDashboardPage', login.requireAuth, adminController.showAdminDashboard);
router.get('/adminCarPage', login.requireAuth, adminController.showAdminCarPage);
router.get('/adminLogout', adminController.logout);
module.exports = router;
