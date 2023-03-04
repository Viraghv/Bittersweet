const express = require('express');
const router = express.Router();
const shoppingListController = require('../controllers/shoppingListController');
const authMiddleware = require('../middlewares/auth');

router.get('/currentUserList', authMiddleware, shoppingListController.getCurrentUserList);

router.post('/add/category', authMiddleware, shoppingListController.addCategory);
router.post('/add/categoryAndItems', authMiddleware, shoppingListController.addCategoryAndItems);
router.post('/add/items/:id', authMiddleware, shoppingListController.addItemsToCategoryById);

router.post('/edit/category/:id', authMiddleware, shoppingListController.editCategoryById);
router.post('/edit/item/setDone/:id', authMiddleware, shoppingListController.setItemDoneById)

router.get('/delete/category/:id', authMiddleware, shoppingListController.deleteCategoryById);
router.get('/delete/all/category', authMiddleware, shoppingListController.deleteAllCategoriesOfCurrentUser);
router.get('/delete/items/allDone', authMiddleware, shoppingListController.deleteAllDoneItemsOfUser);

module.exports = router;