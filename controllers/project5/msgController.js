const Msg = require('../../models/project5/msg')
const { body, validationResult} = require('express-validator')

//decode html entities
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();

exports.msg_create_get = function(req, res, next) {
  res.render('./Project5/message_form', {title: 'Create New Message', user: req.user})
}

exports.msg_create_post = [
  //Basic validate and sanitization of the fields
  body('title', 'Title must not be empty').trim().isLength({min:1}).escape(),
  body('text', 'Message body must not be empty').trim().isLength({min:1}).escape(),

  //Process request after validation and sanitization
  (req, res, next) => {

    //Extract the validation errors
    const errors = validationResult(req)

    //Create message object
    var msg = new Msg({
      title: req.body.title,
      text: req.body.text,
      userName: req.user.userName
    })
    if (!errors.isEmpty()) {
      //There are errors so rerender the form
      res.render('./Project5/message_form', {title: 'Create New Message', user: req.user, msg: msg, errors: errors.array()})
    } else {
      msg.save(function (err) {
        if (err) {return next(err)}
        res.redirect('/fifthProject')
      })
    }
  }
]

//Display all the messages on the home page, new updated index home page
exports.msg_home_get = function(req, res, next) {
  Msg.find({}, 'title userName text timestamp')
  .exec(function (err, list_msgs) {
    if (err) {return next(err)}
    var i;
    //really weird bug where you cant have both msgs[i].text and title in the for loop
    //without crashing
    for (i = 0; i < list_msgs.length; i++)
      list_msgs[i].text = entities.decode(list_msgs[i].text)
      //Having this line causes the crash
      // list_msgs[i].title = entities.decode(list_msgs[i].title)
    for (i = 0; i < list_msgs.length; i++)
      list_msgs[i].title = entities.decode(list_msgs[i].title)
    res.render('./Project5/index', {title: 'Home Page', user: req.user, msg_list: list_msgs})
  })
}

//Delete a message
exports.msg_home_delete = function(req, res, next) {
  //GET ID from form field
  Msg.findByIdAndRemove(req.body.id, function deleteItem(err) {
    if (err) return next(err)
    //Succesful so redirect back to home page
    res.redirect('/fifthProject')
  })
}