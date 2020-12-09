var mongoose = require('mongoose')

var Schema = mongoose.Schema

var ItemSchema = new Schema({
  name: {type: String, minlength:3, maxlength: 100, required: true},
  category: {type: Schema.Types.ObjectId, ref: 'Category', required: true},
  description: {type: String, required: true,  minlength:3},
  price: { type: Number, required: true},
  stock: { type: Number, required: true},
  image: { type: String}
})

//Virtual for Item's url
ItemSchema
.virtual('url')
.get(function () {
  return ('/fourthProject/item/' + this._id)
})

//Export model
module.exports = mongoose.model('Item', ItemSchema)