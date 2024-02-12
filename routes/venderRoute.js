const express = require('express');
const multer = require('multer');
const venderController = require('../controllers/venderController');
const middleware = require('../middleware/vender');
// const { upload } = require('../service/fileUpload-delete');

const upload = multer({ dest: '/upload/' });

const router = express.Router();
router.get('/', middleware.loginMiddleWare, venderController.loginPage);
router.get('/login', middleware.loginMiddleWare, venderController.loginPage);
router.post('/Dashboard', venderController.showVenderDashboard);
router.get('/signUp', middleware.loginMiddleWare, venderController.signUpPage);
router.post('/signupVender', middleware.loginMiddleWare, venderController.signupVender);
router.get('/dashboardPage', venderController.showDashboard);
router.get('/carPage', middleware.requireAuth, venderController.venderCarPage);
router.post('/addCars', middleware.requireAuth, middleware.requireAuth, upload.single('carImage'), middleware.addImage, venderController.addCarVender);
router.post('/updateCarDetails', middleware.requireAuth, upload.single('carImage'), middleware.addImage, venderController.updateCar);
router.get('/getCarDetails', middleware.requireAuth, venderController.getCar);
router.get('/carPage/deleteCar', middleware.requireAuth, venderController.deleteCar);
router.get('/venderLogout', middleware.requireAuth, venderController.venderLogout);

module.exports = router;
