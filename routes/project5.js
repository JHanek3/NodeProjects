var express = require('express');
var router = express.Router();

//Require controller modules
var user_controller = require('../controllers/project5/userController')
var msg_controller = require('../controllers/project5/msgController')

/* GET home page. */
router.get('/', msg_controller.msg_home_get);

/// Signup&User Routes ///
//Signup Get Route
router.get('/signup', user_controller.user_signup_get)

//Signup Post Route
router.post('/signup', user_controller.user_signup_post)

/// User routes ///
//Update membership GET route
router.get('/membership', user_controller.user_membership_get)

//Update membership POST route
router.post('/membership', user_controller.user_membership_post)

//Login GET route
router.get('/login', user_controller.user_login_get)

//Login POST route
router.post('/login', user_controller.user_login_post)

//Admin registration get
router.get('/admin', user_controller.user_admin_get)

//Admin registration post
router.post('/admin', user_controller.user_admin_post)

///Msg Routes///
//newmessage get route
router.get('/newmessage', msg_controller.msg_create_get)

//newmessage post route
router.post('/newmessage', msg_controller.msg_create_post)

//Delete a message post route
router.post('/', msg_controller.msg_home_delete)

//User logout
router.get("/logout", user_controller.user_logout)

module.exports = router;
