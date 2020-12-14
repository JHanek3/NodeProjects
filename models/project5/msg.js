var mongoose = require('mongoose')

var Schema = mongoose.Schema

const {DateTime} = require("luxon")

var MsgSchema = new Schema({
  title: {type: String, required: true, minlength:3, maxlength:100},
  userName: {type: String, required: true},
  text: {type: String, required: true, minlength:3},
  timestamp: { type: Date, default: Date.now}
})

//Virtual for timestamp formatted
MsgSchema
.virtual('timestamp_formatted')
.get(function () {
  return this.timestamp ? DateTime.fromJSDate(this.timestamp).toLocaleString(DateTime.DATETIME_SHORT) : '';
})


module.exports = mongoose.model('Msg', MsgSchema)