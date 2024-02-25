const express = require('express');
const multer = require('multer');
const vendorController = require('../controllers/vendorController');
const middleware = require('../middleware/vendor');
// const { upload } = require('../service/fileUpload-delete');

const upload = multer({ dest: '/upload/' });

const router = express.Router();
router.get('/', middleware.loginMiddleWare, vendorController.loginPage);
router.get('/login', middleware.loginMiddleWare, vendorController.loginPage);
router.post('/Dashboard', middleware.loginMiddleWare, vendorController.showVendorDashboard);
router.get('/signUp', middleware.requireAuth, vendorController.signUpPage);
router.post('/signupVendor', middleware.loginMiddleWare, vendorController.signupVendor);
router.get('/dashboardPage', middleware.requireAuth, vendorController.showDashboard);
router.get('/carPage', middleware.requireAuth, vendorController.vendorCarPage);
router.post('/addCars', middleware.requireAuth, middleware.requireAuth, upload.single('carImage'), middleware.addImage, vendorController.addCarVendor);
router.post('/updateCarDetails', middleware.requireAuth, upload.single('carImage'), middleware.addImage, vendorController.updateCar);
router.get('/getCarDetails', middleware.requireAuth, vendorController.getCar);
router.get('/carPage/deleteCar', middleware.requireAuth, vendorController.deleteCar);
router.get('/vendorLogout', middleware.requireAuth, vendorController.vendorLogout);
router.get('/Notification', middleware.requireAuth, vendorController.vendorNotification);
router.post('/RecoveryMessage', middleware.requireAuth, vendorController.venderRecoveryMessage);

module.exports = router;
