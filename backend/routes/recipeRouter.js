const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const recipeController = require('../controller/recipeController');
const multer = require('multer');
const BadRequest = require("../exceptions/BadRequest");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/recipe_images');
    },
    filename: (req, file, cb) => {
        const extention = file.originalname.split('.')[1];

        cb(null, req.params.id + '.' + extention);
    },
})

const fileFilter = function (req, file, cb) {
    const allowedTypes = ["image/jpeg", "image/png"];
    const fileSize = parseInt(req.headers["content-length"])

    req.fileValidationErrors = [];

    if(!allowedTypes.includes(file.mimetype)){
        req.fileValidationErrors.push('Incorrect file type.');
    }

    if(fileSize > 1024000){
        req.fileValidationErrors.push("File can't be bigger than 1MB.");
    }

    if(req.fileValidationErrors.length > 0){
        return cb(null, false);
    }

    cb(null, true);
}

const upload = multer({
    storage: storage,
    fileFilter,
})

router.post('/create', authMiddleware, recipeController.createOne);
router.post('/uploadImage/:id', authMiddleware, upload.single('image'), recipeController.uploadImage);

router.get('/recipeById/:id', recipeController.getRecipeById);
router.get('/recipeImage/:filename', recipeController.getRecipeImage);
router.get('/allRecipeCount', recipeController.getAllRecipeCount);
router.get('/getAllCardsWithPagination/:page', recipeController.getAllRecpieCardsWithPagination)

router.get('/commentsByRecipeId/:id/:page', recipeController.getCommentsByRecipeId);
router.get('/commentCount/:id', recipeController.getCommentCountById);
router.get('/averageRating/:id', recipeController.getAverageRatingById);

router.post('/addComment', authMiddleware, recipeController.addComment);
router.post('/editComment', authMiddleware, recipeController.editComment);
router.get('/getCommentOfCurrentUserByRecipeId/:id', authMiddleware, recipeController.getCommentOfCurrentUserByRecipeId);

router.get('/units', authMiddleware, recipeController.getAllUnits);
router.get('/difficulties', authMiddleware, recipeController.getAllDifficulties);
router.get('/categories', authMiddleware, recipeController.getAllCategories);
router.get('/allergens', authMiddleware, recipeController.getAllAllergens);
router.get('/costs', authMiddleware, recipeController.getAllCosts);

module.exports = router;