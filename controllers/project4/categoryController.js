var Category = require('../../models/project4/category')
var Item = require('../../models/project4/item')

var async = require('async')
const { body, validationResult} = require("express-validator")

const pwd = process.env.admin_pwd

//Display counts for our index page
exports.index = function(req, res) {
  
  async.parallel({
    armor_count: function(callback) {
      Item.countDocuments({category: "5fd11c9045260f483061648e"}, callback)
    },
    weapon_count: function(callback) {
      Item.countDocuments({category: "5fd11c9145260f483061648f"}, callback)
    },
    vehicle_count: function(callback) {
      Item.countDocuments({category: "5fd11c9145260f4830616490"}, callback)
    },
    squad_count: function(callback) {
      Item.countDocuments({category: "5fd11c9145260f4830616491"}, callback)
    }
  }, function(err, results) {
    res.render('./Project4/index', {title: 'Spartan Deployment Home', error: err, data: results})
  })
}

//Display list of categories (READ)
exports.category_list = function(req, res, next) {
  Category.find()
  .exec(function (err, list_categories) {
    if (err) { return next(err)}
    //SsR
    res.render('./Project4/category_list', {title: 'Category List', category_list: list_categories})
  })
}

//Display detail page for a specific category (READ)
exports.category_detail = function(req, res, next) {
  async.parallel({
    category: function(callback) {
      Category.findById(req.params.id)
        .exec(callback)
    },
    category_items: function(callback) {
      Item.find({ 'category': req.params.id})
        .exec(callback)
    }
  }, function(err, results) {
    if (err) { return next(err) }
    if (results.category==null) {
      var err = new Error('Category not found')
      err.status= 404
      return next(err)
    }
    //SsR
    res.render('./Project4/category_detail', {title: 'Category Detail', category: results.category, category_items: results.category_items})
  })
}

//Display Category create form on GET
exports.category_create_get = function(req, res, next) {
  res.render('./Project4/category_form', { title: 'Create Category'})
}

//Handle Category create on POST
exports.category_create_post = [

  //Validate and sanitize the name field
  body('name', 'Category name must contain at least 3 characters').trim().isLength({ min: 3}).escape(),
  body('description', 'Description must not be empty').trim().isLength({ min: 1}).escape(),

  //Process request after validation and sanitization
  (req, res, next) => {

    //Extract the validation errors from a request
    const errors = validationResult(req)

    //Create category object
    var category = new Category({
      name: req.body.name,
      description: req.body.description,
    })

    if(!errors.isEmpty()) {
      //There are errors render the form again with sanitized values and error messages
      res.render('./Project4/category_form', {title: 'Create Category', category: category, errors: errors.array()})
      return
    } else {
      //Check if Category with same name already exists
      Category.findOne({ 'name': req.body.name})
        .exec(function(err, found_category){
          if (err) {return next(err)}

          if (found_category) {
            //Category exists,redirect to its detail page
            res.redirect(found_category.url)
          } else {
            category.save(function (err) {
              //Category saved, redirect to the category detail page
              res.redirect(category.url)
            })
          }
        })

    
    }
  }
]

//Display Category update form on GET
exports.category_update_get = function(req, res, next) {
  Category.findById(req.params.id, function(err, category) {
    if (err) { return next(err) }
    if (category == null) { //No results
      var err = new Error('Category Not Found')
      err.status = 404
      return next(err)
    }
    //SsR
    res.render('./Project4/category_uform', {title: 'Update Category', category: category})
  })
}

//Handle Category Update on POST
exports.category_update_post = [
  //Validate and sanitize the name fields
  body('name', 'Category name must contain at least 3 characters').trim().isLength({ min: 3}).escape(),
  body('description', 'Description must not be empty').trim().isLength({ min: 1}).escape(),
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

    //Extract the validation errors from request
    const errors = validationResult(req)

    //Create a category object with escaped and trimmed data along with its old id
    var category = new Category({
      name: req.body.name,
      description: req.body.description,
      _id: req.params.id
    })

    if (!errors.isEmpty()) {
      //There are errors, rerender the form again with the sanitized values and error message
      res.render('./Project4/category_uform', { title: 'Update Category', category: category, errors: errors.array()})
    return;
    } else {
      //Date form is valid, update the record
      Category.findByIdAndUpdate(req.params.id, category, {}, function(err, thecategory){
        if (err) { return next(err) }
          //Succsful = redirect to category detail page
          res.redirect(thecategory.url)
      })
    }
  }
]

//Handle category GET Delete
exports.category_delete_get = function(req, res, next) {
  async.parallel({
    category: function(callback) {
      Category.findById(req.params.id).exec(callback)
    },
    category_items: function(callback) {
      Item.find({ 'category': req.params.id}).exec(callback)
    }
  }, function(err, results) {
    if (err) {return next(err)}
    if (results.category==null) {//No results
      res.redirect('/fourthProject/category')
    }
    //SsR
    res.render('./Project4/category_delete', { title: 'Delete Category', category: results.category, category_items: results.category_items})
  })
}

exports.category_delete_post = [

  //Validate and sanitize the fields
  body('pwd', 'Password must not be empty').trim().isLength({ min: 1}).escape()
  .custom(async (confirmPassword, {req}) => {
    //uneccessary
    // const cat = (await Category.findById(req.params.id)).execPopulate(callback)
    // const cat_items = Item.find({ 'category': req.params.id}).exec(callback)
    // if (cat_items > 0) {
    //   throw new Error('Category still has items')
    // }
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
        async.parallel({
              category: function(callback) {
                Category.findById(req.params.id).exec(callback)
              },
              category_items: function(callback) {
                Item.find({ 'category': req.params.id }).exec(callback)
              }
            }, function(err, results) {
              if (err) {return next(err)}
              res.render('./Project4/category_delete', {title: 'Delete Category', category: results.category, category_items: results.category_items,  errors: errors.array()})
            })
        } else {
          //Category has no items, so delete the category object and redirect to the list
          Category.findByIdAndRemove(req.body.id, function deleteCategory(err) {
          if (err) { return next(err) }
            //Ssr
          res.redirect('/fourthProject/category')
          })
        }
      }
]