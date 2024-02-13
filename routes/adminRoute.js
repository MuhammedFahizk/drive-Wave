/* eslint-disable no-return-await */
/* eslint-disable semi */
const express = require('express');
const multer = require('multer')
const adminController = require('../controllers/adminController');
const login = require('../middleware/admin');

const upload = multer({ dest: '/upload/' })

const router = express.Router();

router.get('/', login.loginMiddleWare, adminController.showLoginPageAdmin);
router.get('/login', login.loginMiddleWare, adminController.showLoginPageAdmin);
router.get('/login/getOtp', adminController.OtpPage);
router.post('/generateOtp', adminController.otpGenerate);
router.post('/login/otp', login.loginMiddleWare, adminController.loginOtp);
router.post('/Dashboard', adminController.getAdminDashBoard);
router.get('/DashboardPage', login.requireAuth, adminController.showAdminDashboard);
router.get('/carPage', login.requireAuth, adminController.showAdminCarPage);
router.get('/adminLogout', adminController.logout);
router.post('/addCars', login.requireAuth, upload.single('carImage'), login.addImage, adminController.addCarAdmin);
router.get('/getCarDetails', login.requireAuth, adminController.getCar);
router.get('/carPage/deleteCar', login.requireAuth, adminController.deleteCar);
router.post('/updateCarDetails', login.requireAuth, upload.single('carImage'), login.addImage, adminController.updateCar);
router.get('/carPage/findCarCategories', login.requireAuth, adminController.findCarCategories);
router.get('/alphabeticallySort', login.requireAuth, adminController.alphabeticallySort);
router.get('/searchByCarName', login.requireAuth, adminController.searchByCarName);
router.get('/notification', login.requireAuth, adminController.viewNotificationPage)
router.get('/disableVendor', login.requireAuth, adminController.disableVendor);
router.get('/enableVendor', login.requireAuth, adminController.enableVendor);

// adminVendor routs
router.get('/Vendor', login.requireAuth, adminController.vendorPage);
router.get('/getVendorDetails', login.requireAuth, adminController.vendorDetails);
router.get('/deleteVendor', login.requireAuth, adminController.deleteVendor);
router.get('/vendor/alphabeticallySort', login.requireAuth, adminController.alphabeticallySortVendor);
router.post('/searchVendor', login.requireAuth, adminController.searchingVendor);
//  admin user page
router.get('/users', login.requireAuth, adminController.userPage);
router.get('/getUserDetails', login.requireAuth, adminController.userDetails);
router.get('/user/alphabeticallySort', login.requireAuth, adminController.alphabeticallySortUser);
router.post('/searchUser', login.requireAuth, adminController.searchingUser);
router.get('/deleteUser', login.requireAuth, adminController.deleteUser);

module.exports = router;
