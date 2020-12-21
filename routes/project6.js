var express = require('express');
var router = express.Router();

//Require controller modules
var user2_controller = require("../controllers/project6/user2Controller")

/* GET home page. */
router.get('/', user2_controller.home_page_get);

//Login @ index
router.post('/', user2_controller.home_page_post)

//Logout @ index
router.post("/logout", user2_controller.home_page_logout)

//Get for signup page
router.get('/signup', user2_controller.sign_up_get)

//Post for signup page
router.post('/signup', user2_controller.sign_up_post)

//Get for forgot page
router.get('/forgot', user2_controller.forgot_pwd_get)

//Post for forgot page
router.post('/forgot', user2_controller.forgot_pwd_post)

//Get for reset page
router.get('/reset/:token', user2_controller.reset_pwd_get)

//Post for forgot page
router.post('/reset/:token', user2_controller.reset_pwd_post)

module.exports = router;
