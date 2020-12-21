var mongoose = require("mongoose")

var Schema = mongoose.Schema

var User2Schema = new Schema({
  firstName: {type: String, required: true, minlength: 2, maxlength:50},
  lastName: {type: String, required: true, minlength: 2, maxlength:50},
  email: {type: String, required: true, minlength: 2, maxlength:50},
  password: {type: String, required: true},
  resetPasswordToken: String,
  resetPasswordExpires: Date
})

module.exports = mongoose.model('User2', User2Schema)