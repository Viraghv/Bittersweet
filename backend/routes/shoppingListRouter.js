const express = require('express');
const router = express.Router();
const shoppingListController = require('../controllers/shoppingListController');
const authMiddleware = require('../middlewares/auth');

// get full shopping list of current user
router.get('/currentUserList', authMiddleware, shoppingListController.getCurrentUserList);

// add new category for current user
router.post('/add/category', authMiddleware, shoppingListController.addCategory);
// add new category and items in it for current user
router.post('/add/categoryAndItems', authMiddleware, shoppingListController.addCategoryAndItems);
// add items to category by categoryId
router.post('/add/items/:id', authMiddleware, shoppingListController.addItemsToCategoryById);

// edit category name by categoryId
router.post('/edit/category/:id', authMiddleware, shoppingListController.editCategoryById);
// set item's 'done' attribute by itemId
router.post('/edit/item/setDone/:id', authMiddleware, shoppingListController.setItemDoneById)

// delete category by categoryId
router.get('/delete/category/:id', authMiddleware, shoppingListController.deleteCategoryById);
// delete every category of current user
router.get('/delete/all/category', authMiddleware, shoppingListController.deleteAllCategoriesOfCurrentUser);
// delete all items set as 'done' for current user
router.get('/delete/items/allDone', authMiddleware, shoppingListController.deleteAllDoneItemsOfUser);

module.exports = router;