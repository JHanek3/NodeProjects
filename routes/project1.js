var express = require('express')
var router = express.Router()

//Get index page for firstProject
router.get('/', function(req, res, next) {
  res.render('./Project1/index')
})

router.get('/about', function(req, res, next) {
  res.render('./Project1/about')
})

router.get('/contact-me', function(req, res, next) {
  res.render('./Project1/contact-me')
})

router.get('*', function(req, res) {
  res.render('./Project1/404')
})

module.exports = router;
