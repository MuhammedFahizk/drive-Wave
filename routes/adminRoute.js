const express = require('express');
const multer = require('multer');
const adminController = require('../controllers/adminController');
const login = require('../middleware/admin');

const upload = multer({ dest: '/tmp/' });

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
router.get('/notification', login.requireAuth, adminController.viewNotificationPage);
router.get('/disableVendor', login.requireAuth, adminController.disableVendor);
router.get('/enableVendor', login.requireAuth, adminController.enableVendor);
router.get('/Booking', login.requireAuth, adminController.BookingPage);
router.get('/Payment', login.requireAuth, adminController.payment);
router.post('/changCarStatus', login.requireAuth, adminController.changCarStatus);
router.get('/service', login.requireAuth, adminController.servicePage);
router.post('/servicePage', login.requireAuth, upload.single('serviceImage'), login.addImage, adminController.addService);
router.post('/editService', login.requireAuth, upload.single('serviceImage'), login.addImage, adminController.editService);
router.delete('/service/:id', login.requireAuth, adminController.deleteService);
router.post('/banner', login.requireAuth, upload.single('bannerImage'), login.addImage, adminController.addBanner);
router.get('/banner/:bannerId', login.requireAuth, adminController.getBanner);
router.post('/bannerDelete/:bannerId', login.requireAuth, adminController.deleteBanner);
router.post('/locations', login.requireAuth, adminController.addLocations);
router.post('/removeLocation', login.requireAuth, adminController.removeLocation);
// // adminVendor routs
router.get('/Vendor', login.requireAuth, adminController.vendorPage);
router.get('/getVendorDetails', login.requireAuth, adminController.vendorDetails);
router.get('/deleteVender', login.requireAuth, adminController.deleteVendor);
// //  admin user page
router.get('/users', login.requireAuth, adminController.userPage);
router.get('/getUserDetails', login.requireAuth, adminController.userDetails);
router.get('/deleteUser', login.requireAuth, adminController.deleteUser);
router.get('/deleteUserData', login.requireAuth, adminController.deleteUserData);
router.get('/deleteCancelUser', login.requireAuth, adminController.deleteCancelUser);

module.exports = router;
