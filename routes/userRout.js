const express = require('express');

const userController = require('../controllers/userController');
const middleware = require('../middleware/user');

const router = express.Router();

router.get('/', userController.getHomePage);
router.get('/login', middleware.loginMiddleWare, userController.loginPage);
router.get('/register', middleware.loginMiddleWare, userController.register);
router.post('/userLogin', userController.userLogin);
router.get('/profile', middleware.requireAuth, userController.profilePage);
router.get('/logout', middleware.requireAuth, userController.logoutUser);
router.post('/editUser', middleware.requireAuth, userController.updateUser);
router.post('/deleteUser', middleware.requireAuth, userController.deleteUser);
router.get('/cars', userController.showCars);
router.post('/filterCars', userController.filterCars);
router.get('/carDetails', userController.carDetailsUser);
router.post('/searchCar', userController.carSearchByName);
router.post('/generateOtp', userController.generateOtpEmail);
router.post('/checkOtpUser', userController.userOtpCheck);
router.post('/registrationValidation', userController.registrationValidation);
router.get('/contact', userController.contactPage);
router.post('/contactMessage', userController.userMessageToAdmin);
router.get('/about', userController.aboutPage);
router.get('/carBooking', middleware.LoginUser, userController.carBookingPage);
router.post('/carBooking', middleware.LoginUserPost, userController.carBookingPagePost);
router.post('/addWishlist', userController.addToWishlist);
router.get('/whishList', userController.wishListPage);
router.post('/carBooked', userController.carAddToBooking);
router.get('/bookedCars', userController.bookedCarsPage);

module.exports = router;
