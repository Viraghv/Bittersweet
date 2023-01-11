const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const recipeController = require('../controller/recipeController');
const multer = require('multer');
const BadRequest = require("../exceptions/BadRequest");
const fs = require("fs");

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

const multerUpload = multer({
    storage: storage,
    fileFilter,
})

const uploadFile = function (req, res, next) {
    const upload = multerUpload.single('image');

    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            console.log("MulterError occured: ");
            console.log(err);
        } else if (err) {
            console.log("Unknown error occured: ");
            console.log(err);
        }
        next()
    })
}

const deleteImage = function (req, res, next){
    const directory = "./uploads/recipe_images/"

    fs.readdir(directory, (err, files) => {
        files.forEach(file => {
            if(file.split('.')[0] === String(req.params.id)){
                fs.unlinkSync(directory + file);
            }
        });
    });

    next();
}

router.post('/create', authMiddleware, recipeController.createOne);
router.post('/uploadImage/:id', authMiddleware, deleteImage, uploadFile, recipeController.uploadImage);
router.post('/edit/:id', authMiddleware, recipeController.editRecipeOfCurrentUser)
router.get('/delete/:id', authMiddleware, recipeController.deleteRecipeOfCurrentUser);

router.get('/recipeById/:id', recipeController.getRecipeById);
router.get('/recipeImage/:filename', recipeController.getRecipeImage);
router.get('/allRecipeCount', recipeController.getAllRecipeCount);
router.get('/getAllCardsWithPagination/:page', recipeController.getAllRecpieCardsWithPagination)
router.post('/getFilteredCards/:sortBy/:page', recipeController.getFilteredRecipeCards)

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