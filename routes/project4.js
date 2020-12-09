const { Router } = require('express');
var express = require('express');
var router = express.Router();


//Require controller modules
var category_controller = require('../controllers/project4/categoryController')
var item_controller = require('../controllers/project4/itemController')

// var multer  = require('multer')
// var upload = multer({ dest: '../public/uploads/' })

/* GET home page. */
router.get('/', category_controller.index)

///CATEGORY ROUTES ///
//Basic get page showing a list of categories
router.get('/category', category_controller.category_list)

//Display detail page for a specific Category
router.get('/category/:id', category_controller.category_detail)


//Display form to creating a category
router.get('/new/category', category_controller.category_create_get)

//POST request for creating a category
router.post('/new/category', category_controller.category_create_post)

//Display update form for a category
router.get('/category/:id/update', category_controller.category_update_get)

//Post request to update category
router.post('/category/:id/update', category_controller.category_update_post)

//Get request to display delete form
router.get('/category/:id/delete', category_controller.category_delete_get)

//Post request to delete the category
router.post('/category/:id/delete', category_controller.category_delete_post)

///ITEMS ROUTES///
//Basic get page showing a list of items
router.get('/item', item_controller.item_list)

//Display detail page for a specific item (Need to edit here to show images)
router.get('/item/:id', item_controller.item_detail)

//Display POST form (Need to edit here to show images)
router.get('/new/item', item_controller.item_create_get)

//Process post form (Need to edit here to show images)
router.post('/new/item', item_controller.item_create_post)

//Process Update get request (Need to edit here to show images)
router.get('/item/:id/update', item_controller.item_update_get)

//Process Update post request (Need to edit here to show images)
router.post('/item/:id/update', item_controller.item_update_post)

//Process Delete get request
router.get('/item/:id/delete', item_controller.item_delete_get)

//Process Delete POST request
router.post('/item/:id/delete', item_controller.item_delete_post)

module.exports = router;