var mongoose = require('mongoose')

var Schema = mongoose.Schema

const {DateTime} = require("luxon")

var AuthorSchema = new Schema({
  first_name: {type: String, required: true, maxlength: 100},
  family_name: {type: String, requried: true, maxlength: 100},
  date_of_birth: {type: Date},
  date_of_death: {type: Date},
})

//Virtual for Author's full name
AuthorSchema
.virtual('name')
.get(function () {
  return this.family_name + ', ' + this.first_name
})

//Virtual for Author's lifespan
AuthorSchema
.virtual('lifespan')
.get(function () {
  return (this.date_of_death.getYear() - this.date_of_birth.getYear()).toString()
})

//Virtual for author's URL
AuthorSchema
.virtual('url')
.get(function () {
  return '/thirdProject/author/' + this._id
})

//Formatted date of birth
AuthorSchema
.virtual('date_of_birth_formatted')
.get(function () {
  return this.date_of_birth ? DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED) : '';
})

//Formatted date of death
AuthorSchema
.virtual('date_of_death_formatted')
.get(function () {
  return this.date_of_death ? DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_MED) : '';
})

//Export model
module.exports = mongoose.model('Author', AuthorSchema)