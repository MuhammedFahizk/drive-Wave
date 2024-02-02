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
router.post('/Dashboard', adminController.getAdminDashBoard);
router.get('/DashboardPage', login.requireAuth, adminController.showAdminDashboard);
router.get('/carPage', login.requireAuth, adminController.showAdminCarPage);
router.get('/adminLogout', adminController.logout);
router.post('/addCars', login.requireAuth, upload.single('carImage'), adminController.addCarAdmin);
router.get('/getCarDetails', login.requireAuth, adminController.getCar);
router.get('/carPage/deleteCar', login.requireAuth, adminController.deleteCar);
router.post('/updateCarDetails', login.requireAuth, upload.single('carImage'), adminController.updateCar);
router.get('/carPage/findCarCategories', login.requireAuth, adminController.findCarCategories);
router.get('/alphabeticallySort', login.requireAuth, adminController.alphabeticallySort);
router.get('/searchByCarName', login.requireAuth, adminController.searchByCarName);
// adminVender routs
router.get('/Vender', login.requireAuth, adminController.venderPage);
router.get('/getVenderDetails', login.requireAuth, adminController.venderDetails);
router.get('/deleteVender', login.requireAuth, adminController.deleteVender);
router.get('/vender/alphabeticallySort', login.requireAuth, adminController.alphabeticallySortVender);
router.post('/searchVender', login.requireAuth, adminController.searchingVender);
module.exports = router;
