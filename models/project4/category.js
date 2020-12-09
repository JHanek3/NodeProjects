var mongoose = require('mongoose')

var Schema = mongoose.Schema

var CategorySchema = new Schema({
  name: {type: String, required: true, minlength:3, maxlength: 100},
  description: {type: String, required: true},
})

//Virtual for category's URL
CategorySchema
.virtual('url')
.get(function () {
  return('/fourthProject/category/' + this._id)
})

//Export the model
module.exports = mongoose.model('Category', CategorySchema)