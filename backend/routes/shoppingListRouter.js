const express = require('express');
const router = express.Router();
const shoppingListController = require('../controller/shoppingListController');
const authMiddleware = require('../middlewares/auth');

router.post('/addCategoryAndItems', authMiddleware, shoppingListController.addCategoryAndItems);
router.post('/addCategory', authMiddleware, shoppingListController.addCategory);

module.exports = router;