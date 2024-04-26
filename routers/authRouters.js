const express = require('express');
const authcontroller = require('./../controllers/authcontroller');
const router = express.Router();
router.route('/login').post(authcontroller.login);
module.exports = router;