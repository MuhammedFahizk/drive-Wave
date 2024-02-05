const express = require('express');

const userController = require('../controllers/userController');
const middleware = require('../middleware/user');

const router = express.Router();

router.get('/', userController.getHomePage);
router.get('/login', middleware.loginMiddleWare, userController.loginPage);
router.get('/register', middleware.loginMiddleWare, userController.register);
router.post('/userRegister', userController.userRegistration);
router.post('/userLogin', userController.userLogin);
router.get('/profile', middleware.requireAuth, userController.profilePage);
router.get('/logout', middleware.requireAuth, userController.logoutUser);
router.post('/editUser', middleware.requireAuth, userController.updateUser);
router.post('/deleteUser', middleware.requireAuth, userController.deleteUser);
module.exports = router;
