const express = require('express');

const userController = require('../controllers/userController');
const middleware = require('../middleware/user');

const router = express.Router();

router.get('/', userController.getHomePage);
router.get('/login', middleware.loginMiddleWare, userController.loginPage);
router.get('/logout', middleware.requireAuth, userController.logoutUser);
router.post('/userLogin', userController.userLogin);
router.get('/profile', middleware.requireAuth, userController.profilePage);
router.post('/editUser', middleware.requireAuth, userController.updateUser);
router.get('/deleteUser', middleware.requireAuth, userController.deleteUser);
router.get('/cars', middleware.auth, userController.showCars);
router.get('/car', middleware.auth, userController.allCars);
router.post('/filterCars', middleware.auth, userController.filterCars);
router.get('/carDetails', middleware.auth, userController.carDetailsUser);
router.post('/generateOtp', middleware.auth, userController.generateOtpEmail);
router.post('/checkOtpUser', middleware.auth, userController.userOtpCheck);
router.post('/OtpUser', middleware.auth, userController.OtpCheck);
router.post('/forgotPassword', middleware.auth, userController.forgotPassword);
router.post('/registration', middleware.auth, userController.registration);
router.get('/contact', middleware.auth, userController.contactPage);
router.post('/Message', middleware.auth, userController.userMessageToAdmin);
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
router.post('/review', middleware.mustLogin, userController.review);
router.post('/bookNow', userController.bookNow);

module.exports = router;
