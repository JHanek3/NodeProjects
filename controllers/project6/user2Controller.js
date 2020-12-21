//require models
var User2 = require("../../models/project6/user2")

const {body, validationResult, check} = require('express-validator')
const bcrypt = require('bcryptjs')
const passport = require("../../config/passport")
const async = require('async')
const crypto = require('crypto')
const sgMail = require('@sendgrid/mail')

require('dotenv').config()
sgMail.setApiKey(process.env.SENDGRID_API_KEY)



//Get request for home page
exports.home_page_get = function(req, res, next) {
  res.render('./Project6/index', {title: 'Home Page', user: req.user})
}

//Post request for login
exports.home_page_post = function(req, res, next) {
  passport.authenticate('loginUser',{successRedirect: "/sixthProject",
                                     failureRedirect: "/sixthProject",
                                  // failureFlash: "Incorrect username or password"
  })(req, res, next)
}

//Post request for logout
exports.home_page_logout = function(req, res, next) {
  req.logout()
  res.redirect("/sixthProject")
}

exports.sign_up_get = function(req, res, next) {
  res.render('./Project6/signup_form', {title: "Sign Up"})
}

exports.sign_up_post = [
  //Validate and Sanitize the fields
  body('firstName', 'First name must contain at least 2 characters').trim().isLength({min:2}).escape(),
  body('lastName', 'Last name must contain at least 2 characters').trim().isLength({min:2}).escape(),
  check('email', 'Invalid email').isEmail().trim().escape().normalizeEmail(),
  check('password')
    .isLength({min:8}).withMessage('Password must be at least 8 characters')
    .trim()
    .escape(),
  check('confirmPassword', 'Passwords do not match')
    .exists()
    .trim()
    .escape()
    .custom((value, {req}) => value===req.body.password),
  //process after validation and sanitization
  (req, res, next) => {
    //Extract validation errors
    const errors = validationResult(req)

    //Create user object
    var user2 = new User2({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
    })
    if (!errors.isEmpty()){
      //There are errors so rerender the form again with sanitized values and error messages
      res.render('./Project6/signup_form', {title: 'Sign Up', user: user2, errors: errors.array()})
      return
    } else {
      //check if email already exists
      User2.findOne({ 'email': req.body.email})
        .exec(function(err, found_email){
          if (err) {return next(err)}
          if (found_email){
            res.redirect('/sixthProject/forgot')
          } else {
            bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
              if (err) {
                return next(err)
              } else {
                const user2 = new User2({
                  firstName: req.body.firstName,
                  lastName: req.body.lastName,
                  email: req.body.email,
                  password: hashedPassword
                })
                .save(err => {
                  if (err) {
                    return next(err)
                  }
                  req.flash('info', 'Signup Succesful!')
                  res.redirect('/sixthProject')
                })
              }
            })
          }
        })
    }
  }
]

exports.forgot_pwd_get = function(req, res, next) {
  res.render('./Project6/forgot_form', {title: "Forgot Password", user: req.user})
}

exports.forgot_pwd_post = function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex')
        done(err, token)
      })
    },
    function(token, done) {
      User2.findOne({ email: req.body.email}, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email exists')
          return res.redirect('/sixthProject/forgot')
        }
        user.resetPasswordToken = token
        user.resetPasswordExpires = Date.now() + 3600000 //token expires in one hour
        user.save(function(err) {
          done(err, token, user)
        })
      })
    },
    function(token, user, done) {
      const msg =  {
        to: user.email,
        from: "Simplecode4@gmail.com",
        subject: 'Node.js Password reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
        'http://' + req.headers.host + '/sixthProject/reset/' + token + '\n\n' +
        'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      }
      sgMail
        .send(msg, function(err) {
          if (err) {
            console.log(err)
          } else {
            req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.')
            done(err, 'done')
          }
        })
    }
  ], function(err) {
    if (err) return next(err)
    res.redirect('/sixthProject/forgot')
  })
}

exports.reset_pwd_get = function(req, res, next) {
  User2.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now()}}, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or expired')
      return res.redirect('/sixthProject/forgot')
    }
    res.render('./Project6/reset', { user: req.user})
  })
}

exports.reset_pwd_post = [
  //validate and sanitize the fields
  check('password')
    .isLength({min:8}).withMessage('Password must be at least 8 characters')
    .trim()
    .escape(),
  check('confirmPassword', 'Passwords do not match')
    .exists()
    .trim()
    .escape()
    .custom((value, {req}) => value === req.body.password),
  //process after validation and sanitization
  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      //There are errors so rerender
      res.render('./Project6/reset', { errors: errors.array(), user: req.user})
      return
    }
    async.waterfall([
      function(done) {
        User2.findOne({ resetPasswordToken : req.params.token, resetPasswordExpires: { $gt: Date.now()}}, function(err, user) {
          if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.')
            return res.redirect('/sixthProject/forgot')
          } else {
            bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
              if (err) {
                return next(err)
              } else {
                user.password = hashedPassword
                user.resetPasswordToken = undefined
                user.resetPasswordExpires = undefined
                user.save(function(err) {
                  req.flash('info', 'Password Updated!')
                  done(err,user)
                  res.redirect("/sixthProject")
                })
              }
            })
          }
        })
      }
    ])
  }
]