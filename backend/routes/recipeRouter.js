const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const adminAuthMiddleware = require('../middlewares/adminAuth');
const recipeController = require('../controller/recipeController');
const multer = require('multer');
const fs = require("fs");
const {promises:fsPromise} = require('fs');

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

const deleteImage = async function (req, res, next){
    const directory = "./uploads/recipe_images/"
    const files =  await fsPromise.readdir(directory);

    for(const file of files){
        if(file.split('.')[0] === String(req.params.id)){
            await fs.unlinkSync(directory + file);
            break;
        }
    }

    next();
}

router.post('/create', authMiddleware, recipeController.createOne);
router.post('/uploadImage/:id', authMiddleware, deleteImage, uploadFile, recipeController.uploadImage);
router.post('/edit/:id', authMiddleware, recipeController.editRecipeOfCurrentUser);
router.get('/delete/:id', authMiddleware, recipeController.deleteRecipeOfCurrentUser);

router.get('/recipeById/:id', recipeController.getRecipeById);
router.get('/recipeImage/:filename', recipeController.getRecipeImage);
router.get('/allRecipeCount', recipeController.getAllRecipeCount);
router.get('/getAllCardsWithPagination/:page', recipeController.getAllRecpieCardsWithPagination);
router.post('/getFilteredCards/:sortBy/:page', recipeController.getFilteredRecipeCards);

router.get('/comment/get/byRecipeId/:recipeId/:page', recipeController.getCommentsByRecipeId);
router.get('/comment/count/:recipeId', recipeController.getCommentCountById);
router.get('/averageRating/:recipeId', recipeController.getAverageRatingById);

router.post('/comment/add', authMiddleware, recipeController.addComment);
router.post('/comment/edit/:id', authMiddleware, recipeController.editComment);
router.get('/comment/get/currentUser/:recipeId', authMiddleware, recipeController.getCommentOfCurrentUserByRecipeId);

router.get('/difficulties', recipeController.getAllDifficulties);
router.get('/costs', recipeController.getAllCosts);
router.get('/units', recipeController.getAllUnits);
router.get('/categories', recipeController.getAllCategories);
router.get('/diets', recipeController.getAllDiets);
router.get('/allergens', recipeController.getAllAllergens);


router.post('/admin/units/add', adminAuthMiddleware, recipeController.addUnit);
router.post('/admin/units/edit/:id', adminAuthMiddleware, recipeController.editUnit);
router.get('/admin/units/delete/:id', adminAuthMiddleware, recipeController.deleteUnit);

router.post('/admin/categories/add', adminAuthMiddleware, recipeController.addCategory);
router.post('/admin/categories/edit/:id', adminAuthMiddleware, recipeController.editCategory);
router.get('/admin/categories/delete/:id', adminAuthMiddleware, recipeController.deleteCategory);
router.get('/admin/categories/ranked/:page', adminAuthMiddleware, recipeController.getRankedCategories);
router.get('/admin/categories/count', adminAuthMiddleware, recipeController.getCategoriesCount);

router.post('/admin/diets/add', adminAuthMiddleware, recipeController.addDiet);
router.post('/admin/diets/edit/:id', adminAuthMiddleware, recipeController.editDiet);
router.get('/admin/diets/delete/:id', adminAuthMiddleware, recipeController.deleteDiet);

router.post('/admin/allergens/add', adminAuthMiddleware, recipeController.addAllergen);
router.post('/admin/allergens/edit/:id', adminAuthMiddleware, recipeController.editAllergen);
router.get('/admin/allergens/delete/:id', adminAuthMiddleware, recipeController.deleteAllergen);

router.post('/admin/all/:sortBy/:page', adminAuthMiddleware, recipeController.getAllRecipes);
router.post('/admin/all/count', adminAuthMiddleware, recipeController.getAllAdminPageRecipesCount);
router.post('/admin/edit/:id', adminAuthMiddleware, recipeController.editRecipeAdmin);
router.get('/admin/delete/:id', adminAuthMiddleware, recipeController.deleteRecipeAdmin);

router.post('/admin/comment/all/:sortBy/:page', adminAuthMiddleware, recipeController.getAllComments);
router.post('/admin/comment/count', adminAuthMiddleware, recipeController.getAllAdminPageCommentsCount);
router.post('/admin/comment/edit/:id', adminAuthMiddleware, recipeController.editCommentAdmin);
router.get('/admin/comment/delete/:id', adminAuthMiddleware, recipeController.deleteCommentAdmin);


module.exports = router;