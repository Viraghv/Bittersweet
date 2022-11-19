const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const recipeController = require('../controller/recipeController');
const multer = require("multer");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/recipe_images');
    },
    filename: (req, file, cb) => {
        const extention = file.originalname.split('.')[1];

        cb(null, req.params.id + "." + extention);
    }

})

const upload = multer({
    storage: storage,
})

router.post('/create', authMiddleware, recipeController.createOne);
router.post('/uploadImage/:id', authMiddleware, upload.single('image'), recipeController.uploadImage);

router.get('/units', authMiddleware, recipeController.getAllUnits);
router.get('/difficulties', authMiddleware, recipeController.getAllDifficulties);
router.get('/categories', authMiddleware, recipeController.getAllCategories);
router.get('/allergens', authMiddleware, recipeController.getAllAllergens);
router.get('/costs', authMiddleware, recipeController.getAllCosts);

module.exports = router;