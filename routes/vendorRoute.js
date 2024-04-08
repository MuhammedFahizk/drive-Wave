const express = require('express');
const multer = require('multer');
const vendorController = require('../controllers/vendorController');
const middleware = require('../middleware/vendor');

const upload = multer({ dest: '/tmp/' });

const router = express.Router();
router.get('/', middleware.loginMiddleWare, vendorController.loginPage);
router.get('/login', middleware.loginMiddleWare, vendorController.loginPage);
router.post('/Dashboard', middleware.loginMiddleWare, vendorController.showVendorDashboard);
router.get('/signUp', middleware.loginMiddleWare, vendorController.signUpPage);
router.get('/login/getOtp', middleware.loginMiddleWare, vendorController.getOtp);
router.post('/generateOtp', middleware.loginMiddleWare, vendorController.otpGenerate);
router.post('/login/otp', middleware.loginMiddleWare, vendorController.loginOtp);
router.post('/signupVendor', middleware.loginMiddleWare, vendorController.signupVendor);
router.get('/dashboardPage', middleware.requireAuth, vendorController.showDashboard);
router.get('/users', middleware.requireAuth, vendorController.UserPage);
router.get('/Payment', middleware.requireAuth, vendorController.payment);
router.get('/carPage', middleware.requireAuth, vendorController.vendorCarPage);
router.post('/addCars', middleware.requireAuth, middleware.requireAuth, upload.single('carImage'), middleware.addImage, vendorController.addCarVendor);
router.post('/updateCarDetails', middleware.requireAuth, upload.single('carImage'), middleware.addImage, vendorController.updateCar);
router.get('/getCarDetails', middleware.requireAuth, vendorController.getCar);
router.get('/carPage/deleteCar', middleware.requireAuth, vendorController.deleteCar);
router.get('/vendorLogout', middleware.requireAuth, vendorController.vendorLogout);
router.get('/Notification', middleware.requireAuth, vendorController.vendorNotification);
router.post('/RecoveryMessage', middleware.requireAuth, vendorController.venderRecoveryMessage);
router.get('/Booking', middleware.requireAuth, vendorController.bookingPage);
router.post('/changCarStatus', middleware.requireAuth, vendorController.changCarStatus);
router.get('/service', middleware.requireAuth, vendorController.servicePage);
router.post('/servicePage', middleware.requireAuth, upload.single('serviceImage'), middleware.addImage, vendorController.addService);
router.post('/editService', middleware.requireAuth, upload.single('serviceImage'), middleware.addImage, vendorController.editService);
router.delete('/service/:id', middleware.requireAuth, vendorController.deleteService);
router.post('/locations', middleware.requireAuth, vendorController.addLocations);
router.post('/removeLocation', middleware.requireAuth, vendorController.removeLocation);

module.exports = router;
