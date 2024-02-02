const express = require('express');

const userController = require('../controllers/userController');

const router = express.Router();

router.get('/', userController.getHomePage);
module.exports = router;
