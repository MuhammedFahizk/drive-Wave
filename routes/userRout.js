const express = require('express');

const userController = require('../controllers/userController');
const middleware = require('../middleware/user');

const router = express.Router();

router.get('/', userController.getHomePage);
router.get('/login', middleware.loginMiddleWare, userController.loginPage);
router.get('/register', middleware.loginMiddleWare, userController.register);
router.get('/logout', middleware.requireAuth, userController.logoutUser);
router.post('/userLogin', userController.userLogin);
router.get('/profile', middleware.requireAuth, userController.profilePage);
router.post('/editUser', middleware.requireAuth, userController.updateUser);
router.post('/deleteUser', middleware.requireAuth, userController.deleteUser);
router.get('/cars', userController.showCars);
router.post('/filterCars', userController.filterCars);
router.get('/carDetails', userController.carDetailsUser);
router.post('/searchCar', userController.carSearchByName);
router.post('/generateOtp', userController.generateOtpEmail);
router.post('/checkOtpUser', userController.userOtpCheck);
router.post('/OtpUser', userController.OtpCheck);
router.post('/forgotPassword', userController.forgotPassword);
router.post('/registration', userController.registration);
router.get('/contact', userController.contactPage);
router.post('/Message', userController.userMessageToAdmin);
router.get('/about', userController.aboutPage);
router.post('/userMessage', userController.userRecoveryMessage);
router.get('/bookingCar', middleware.mustLogin, userController.bookingCar);
router.get('/addDate', middleware.mustLogin, userController.addDate);
router.get('/changeDate', middleware.mustLogin, userController.changeDate);
router.post('/findCarByDate', userController.findCarByDate);
router.post('/bookedCar', middleware.mustLogin, userController.userBookedCar);
router.get('/bookedCars', middleware.mustLogin, userController.bookedCars);
router.get('/bookings/remove', middleware.mustLogin, userController.removeBookings);
router.get('/userPayRent', middleware.mustLogin, userController.userPayRent);
router.get('/paymentPage', middleware.mustLogin, userController.paymentPage);
router.get('/BookedCar', middleware.mustLogin, userController.carDetails);
router.post('/payment/verification', middleware.mustLogin, userController.paymentVerification);
router.post('/orderDetails', middleware.mustLogin, userController.orderDetails);

module.exports = router;
