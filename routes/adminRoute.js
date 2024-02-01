const express = require('express');
const adminController = require('../controllers/adminController');
const login = require('../middleware/admin');
const { upload } = require('../service/fileUpload-delete');

const router = express.Router();

router.get('/', login.loginMiddleWare, adminController.showLoginPageAdmin);
router.get('/login', login.loginMiddleWare, adminController.showLoginPageAdmin);
router.get('/login/getOtp', adminController.OtpPage);
router.post('/generateOtp', adminController.otpGenerate);
router.post('/login/otp', login.loginMiddleWare, adminController.loginOtp);
router.post('/adminDashboard', adminController.getAdminDashBoard);
router.get('/adminDashboardPage', login.requireAuth, adminController.showAdminDashboard);
router.get('/adminCarPage', login.requireAuth, adminController.showAdminCarPage);
router.get('/adminLogout', adminController.logout);
router.post('/addCars', login.requireAuth, upload.single('carImage'), adminController.addCarAdmin);
router.get('/getCarDetails', login.requireAuth, adminController.getCar);
router.get('/adminCarPage/deleteCar', login.requireAuth, adminController.deleteCar);
router.post('/adminCarPage/updateCarDetails', login.requireAuth, upload.single('carImage'), adminController.updateCar);
router.get('/adminCarPage/findCarCategories', login.requireAuth, adminController.findCarCategories);
router.get('/adminCarPage/alphabeticallySort', login.requireAuth, adminController.alphabeticallySort);
router.get('/adminCarPage/searchByCarName', login.requireAuth, adminController.searchByCarName);
// adminVender routs
router.get('/adminVender', login.requireAuth, adminController.venderPage);
router.get('/getVenderDetails', login.requireAuth, adminController.venderDetails);
router.get('/adminVender/deleteVender', login.requireAuth, adminController.deleteVender);
router.get('/adminVender/alphabeticallySort', login.requireAuth, adminController.alphabeticallySortVender);
router.post('/adminVender/searchVender', login.requireAuth, adminController.searchingVender);
module.exports = router;
