var mongoose = require('mongoose')

var Schema = mongoose.Schema

var UserSchema = new Schema({
  firstName: {type: String, required: true, minlength:2, maxlength:100},
  lastName: {type: String, required: true, minlength:2, maxlength:100},
  userName: {type: String, required: true},
  password: {type: String, required: true},
  membershipStatus: {type: Boolean, default: false, required: true},
  adminStatus: {type: Boolean, required: true, default: false}
})

//Virtual for Users URL
UserSchema
.virtual('url')
.get(function() {
  return('/user/' + this._id)
})

module.exports = mongoose.model('User', UserSchema)