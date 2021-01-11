//require models
var User = require('../../models/project5/user')
var Msg = require('../../models/project5/user')
const passport = require('../../config/passport')

var async = require('async')
const { body, validationResult, check} = require('express-validator')
const bcrypt = require('bcryptjs')

//GET request for user signup form
exports.user_signup_get = function (req, res, next) {
  res.render('./Project5/signup_form', {title: 'Create User'})
}

//POST request for user signup form
exports.user_signup_post = [
  //Basic validate and sanitize the fields
  body('firstName', 'First name must contain at least 2 characters').trim().isLength({ min:2}).escape(),
  body('lastName', 'Last name must contain at least 2 characters').trim().isLength({ min:2}).escape(),
  body('userName', 'Username must contain at least 2 characters').trim().isLength({ min:2}).escape(),
  body('password', 'Password must contain at least 5 characters').trim().isLength({ min:5}).escape(),
  //Check if passwords are the same
  check('password').exists(),
  check('confirmPassword', 'Password confirmation field must have the same value as the password field')
    .exists()
    .custom((value, {req}) => value === req.body.password),
  //Process request after validation and sanitization
  (req, res, next) => {
    
    //Extract the validation Errors
    const errors = validationResult(req)

    //Create user object
    var user = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      userName: req.body.userName,
    })
    if (!errors.isEmpty()) {
      //There are errors so rerender the form again with sanitized values and error messages
      res.render('./Project5/signup_form', {title: 'Create User', user: user, errors: errors.array()})
      return
    } else {
      //Check if username already exists
      User.findOne({ 'userName': req.body.userName})
        .exec(function(err, found_user) {
          if (err) {return next(err)}
          if (found_user) {
            res.render('./Project5/signup_form', {title: 'Create User', user: user, errors: ['That Username is already being used']})
          } else {
            bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
              if (err) {
                return next(err)
              } else {
                const user = new User({
                  firstName: req.body.firstName,
                  lastName: req.body.lastName,
                  userName: req.body.userName,
                  password: hashedPassword,
                  membershipStatus: false
                })
                .save(err => {
                  if (err) {
                    return next(err)
                  }
                  res.redirect('/fifthProject')
                })
              }
            })
          }
        })
    }

  }
]

//Get request for User membership update
exports.user_membership_get = function (req, res, next) {
  res.render('./Project5/membership_form', {title: 'Update Membership', user: req.user})
}

//POST request for User membership update
exports.user_membership_post = [
  //Validate and Sanitize the fields
  check('membershipPassword', 'Incorrect Membership Password')
    .exists()
    .custom((value, {req}) => value === process.env.membership_pwd),
  //Process request after validation and sanitization
  (req, res, next) => {
    //Extract validation errors
    const errors = validationResult(req)
    
    if (!errors.isEmpty()) {
      res.render('./Project5/membership_form', {title: 'Update Membership', user: req.user, errors: errors.array()})
    } else {
      //Date form is valid, update membership status
      const query = { userName: req.user.userName}
      User.findOneAndUpdate(query, {membershipStatus: true}).exec()
      res.redirect('/fifthProject')
    }
  }
]

//Handle for login get
exports.user_login_get = function (req, res, next) {
  res.render('./Project5/login_form', {title: 'Log In'})
}

//Handle for login post
exports.user_login_post = function(req, res, next) {
  passport.authenticate('msgUser', {successRedirect: '/fifthProject/',
                                  successFlash: 'You are logged in!',
                                  failureRedirect: '/fifthProject/login',
                                  failureFlash: 'Incorrect Username or password'
  })(req, res, next)
}

//Handle for admin get
exports.user_admin_get = function(req, res, next) {
  res.render('./Project5/admin_form', {title: 'Admin Registration', user: req.user})
}

//Handle for admin post
exports.user_admin_post = [
  //Validate and Sanitize the fields
  check('adminPassword', 'Incorrect Admin Password')
    .exists()
    .custom((value, {req}) => value === process.env.admin_pwd_msg),
  //Process request after validation and sanitization
  (req, res, next) => {
    //Extract validation errors
    const errors = validationResult(req)
    
    if (!errors.isEmpty()) {
      res.render('./Project5/admin_form', {title: 'Admin Registration', user: req.user, errors: errors.array()})
    } else {
      //Date form is valid, update membership status
      const query = { userName: req.user.userName}
      User.findOneAndUpdate(query, {adminStatus: true}).exec()
      res.redirect('/fifthProject')
    }
  }
]

//Handle logout
exports.user_logout = function(req, res, next) {
  req.logout(),
  res.redirect("/fifthProject")
}