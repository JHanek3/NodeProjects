const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')
const User = require('../models/project5/user')
const User2 = require('../models/project6/user2')

//to deal with pesky html-entities
const Entities = require('html-entities').AllHtmlEntities
const entities = new Entities()

passport.use('msgUser',
  new LocalStrategy((username, password, done) => {
    User.findOne({ userName: username}, (err, user) => {
      if (err) {
        return done(err)
      }
      if (!user) {
        return done(null, false, {msg: "Incorrect username"})
      }
      bcrypt.compare(password, user.password, (err, res) => {
        if(err) return done(err)
        if (res) {
          return done(null, user)
        } else {
          return done(null, false, {msg: "Incorrect Password"})
        }
      })
    })
  })
)

passport.use('loginUser', new LocalStrategy({
  passReqToCallback : true,
  usernameField: 'email'
  }, function(req, username, password, done) {
    var dUsername = (entities.encode(username)).toLowerCase()
    User2.findOne({ email: dUsername}, function(err, user){
      if (err) {return done(err)}
      if (!user) {
        return done(null, false, req.flash("error", "Email not found, this is case sensitive.") )
      }
      bcrypt.compare(password, user.password, (err, res) => {
        if (err) {return done(err)}
        if (res) {
          return done(null, user)
        } else {
          return done(null, false, req.flash("error", "Password incorrect"))
        }
      })
    })
  }
))


function PrincipleInfo(principleId, principleType, details) {
  this.principleId = principleId
  this.principleType = principleType
  this.details = details
}

passport.serializeUser(function (userObject, done) {
  //Could be msgUser or loginUser
  var principleType = "msgUser"
  var userPrototype = Object.getPrototypeOf(userObject)
  if (userPrototype === User.prototype) {
    principleType = "msgUser"
  } else if (userPrototype === User2.prototype) {
    principleType = "loginUser"
  }
  var principleInfo = new PrincipleInfo(userObject.id, principleType, '');
  done(null, principleInfo)
})

passport.deserializeUser(function(principleInfo, done) {
  if (principleInfo.principleType == 'msgUser') {
    User.findById(principleInfo.principleId, function(err, user) {
      done(err, user)
    })
  } else if (principleInfo.principleType == 'loginUser') {
    User2.findById(principleInfo.principleId, function(err, user) {
      done(err, user)
    })
  } 
})

module.exports = passport