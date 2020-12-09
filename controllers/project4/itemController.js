var Item = require('../../models/project4/item')

var async = require('async')
const Category = require('../../models/project4/category')

const { body, validationResult} = require("express-validator")

// var multer = require('multer')
// var upload = multer({ dest: '../public/uploads'})

const pwd = process.env.admin_pwd

//Display list of all items
exports.item_list = function(req, res, next) {
  Item.find({}, 'name category')
  .populate('category')
  .exec(function (err, list_items) {
    if (err) { return next(err)}
    //SsR
    res.render('./Project4/item_list', { title: 'Item List', item_list: list_items})
  })
}

//Display list of of detail item
exports.item_detail = function(req, res, next) {
  Item.findById(req.params.id, 'name category description price stock')
    .populate('category')
    .exec(function (err, detail_item) {
      if (err) { return next(err) }
      //SsR
      res.render('./Project4/item_detail', {title: 'Item Detail', item_detail: detail_item})
    })     
}

//Display Item create form on GET
exports.item_create_get = function(req, res, next) {
  //Get all categories for which we can display label our item in
  async.parallel({
    categories: function(callback) {
      Category.find(callback)
    }
  }, function(err, results) {
    if (err) { return next(err)}
    //Succesful so render
    res.render('./Project4/item_form', { title: 'Create Item', categories: results.categories})
  })
}

//Process POST reqest of item
exports.item_create_post = [

  //Validate and sanitize the fields
  body('name', 'Name must not be empty').trim().isLength({ min: 1}).escape(),
  body('category', 'Category must not be empty').trim().isLength({ min: 1}).escape(),
  body('description', 'Description must not be empty').trim().isLength({ min: 1}).escape(),
  body('price', 'Price must not be empty').trim().isLength({ min: 1}).escape(),
  body('price', 'Price must be an integer').isInt(),
  body('stock', 'Stock must not be empty').trim().isLength({ min: 1}).escape(),
  body('stock', 'Stock must be an integer').isInt(),

  //Process request after validation and sanitization
  (req, res, next) => {

    //Extract the validation errors from a request
    const errors = validationResult(req)

    //Create a item object with the data
    var item = new Item(
      {
        name: req.body.name,
        category: req.body.category,
        description: req.body.description,
        price: req.body.price,
        stock: req.body.stock,
        _id: req.params.id
      }
    )
      if (!errors.isEmpty()) {
        //There are errors, render form again with sanitized values/error messages
        //Get the category that was entered for the item
        async.parallel({
          categories: function(callback) {
            Category.find(callback)
          }
        }, function(err, results) {
          if (err) { return next(err) }
          //Rerender form
          res.render('./Project4/item_form', {title: 'Create Item', categories: results.categories, item: item, errors: errors.array()})
        })
        return
      } else {
        //Date form is valid, check to see if item exists
        Item.findOne({ 'name': req.body.name})
          .exec(function(err, found_item){
            if (err) { return next(err)}

            if (found_item) {
              res.redirect(found_item.url)
            } else {
              item.save(function (err) {
                //Category saved, redirect to the category detail page
                res.redirect(item.url)
              })
            }
          })
      }
  }
]

//Process the update get request
exports.item_update_get = function(req, res, next) {
  //Get item and category from form
  async.parallel({
    item: function(callback) {
      Item.findById(req.params.id).populate('category').exec(callback)
    },
    categories: function(callback) {
      Category.find(callback)
    }
  }, function(err, results) {
    if (err) {return next(err)}
    if (results.item==null) {
      //No results
      var error = new Error("Item not found")
      err.status = 404
      return next(err)
    }
    res.render('./Project4/item_uform', { title: 'Update Item', categories: results.categories, item: results.item})
  })
}

//Process the update post request
exports.item_update_post = [

  //Validate and sanitize the fields
  body('name', 'Name must not be empty').trim().isLength({ min: 1}).escape(),
  body('category', 'Category must not be empty').trim().isLength({ min: 1}).escape(),
  body('description', 'Description must not be empty').trim().isLength({ min: 1}).escape(),
  body('price', 'Price must not be empty').trim().isLength({ min: 1}).escape(),
  body('price', 'Price must be an integer').isInt(),
  body('stock', 'Stock must not be empty').trim().isLength({ min: 1}).escape(),
  body('stock', 'Stock must be an integer').isInt()
  .custom(async (confirmPassword, {req}) => {
    const password = req.body.pwd
    confirmPassword = process.env.admin_pwd_unsc
    //Check if they are the same
    if(password !== confirmPassword) {
      throw new Error('Incorrect Password')
    }
  }),

  //Process request after validation and sanitization
  (req, res, next) => {

    //Extract the validation errors from a request
    const errors = validationResult(req)

    //Create a item object with the data
    var item = new Item(
      {
        name: req.body.name,
        category: req.body.category,
        description: req.body.description,
        price: req.body.price,
        stock: req.body.stock,
        _id: req.params.id
      }
    )
      if (!errors.isEmpty()) {
        //There are errors, render form again with sanitized values/error messages
        //Get the category that was entered for the item
        async.parallel({
          categories: function(callback) {
            Category.find(callback)
          }
        }, function(err, results) {
          if (err) { return next(err) }
          //Rerender form
          res.render('./Project4/item_uform', {title: 'Update Item', categories: results.categories, item: item, errors: errors.array()})
        })
        return
      } else {
        //Date form is valid, update it
        Item.findByIdAndUpdate(req.params.id, item, {}, function (err, theitem) {
          if (err) { return next(err) }
          //Sucecesful so redirect to the item detail page
          res.redirect(theitem.url)
        })
      }
  }
]

//Process get request of deleting an item
exports.item_delete_get = function(req, res, next) {
  async.parallel({
    item: function(callback) {
      Item.findById(req.params.id).populate('category').exec(callback)
    }
  }, function(err, results) {
    if (err) { return next(err) }
    if (results.item == null) {
      res.redirect('/fourthProject/items')
    }
    //SsR
    res.render('./Project4/item_delete', {title: 'Delete Item', item: results.item})
  })
}

//Process post request of deleting an item
exports.item_delete_post = [

  //Validate and sanitize the fields
  body('pwd', 'Password must not be empty').trim().isLength({ min: 1}).escape()
  .custom(async (confirmPassword, {req}) => {
    const password = req.body.pwd
    confirmPassword = process.env.admin_pwd_unsc
    //Check if they are the same
    if(password !== confirmPassword) {
      throw new Error('Incorrect Password')
    }
  }),

  //Process request after validation and sanitization
  (req, res, next) => {

    //Extract the validation errors from a request
    const errors = validationResult(req)

      if (!errors.isEmpty()) {
        //There are errors, render form again with sanitized values/error messages
        //Get the category that was entered for the item
        async.parallel({
          item: function(callback) {
          Item.findById(req.params.id).populate('category').exec(callback)
          }
        }, function(err, results) {
          if (err) { return next(err) }
          //Rerender form
          res.render('./Project4/item_delete', {title: 'Delete Item', item: results.item, errors: errors.array()})
        })
        return
      } else {
        Item.findByIdAndRemove(req.body.id, function deleteItem(err) {
          if (err) { return next(err) }
          //Succsful so redirect to list of Items
          res.redirect('/fourthProject/item')
        })
      }
  }
]