const express = require('express');
const router = express.Router();
const favouriteController = require('../controller/favouriteController');
const authMiddleware = require('../middlewares/auth');

router.get('/add/:id', authMiddleware, favouriteController.addById);
router.get('/delete/:id', authMiddleware, favouriteController.deleteById);
router.get('/allUserFavourites', authMiddleware, favouriteController.getallUserFavourites)

module.exports = router;