const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const adminAuthMiddleware = require('../middlewares/adminAuth');
const recipeController = require('../controllers/recipeController');
const multer = require('multer');
const fs = require("fs");
const {promises:fsPromise} = require('fs');

// set destination and filename to saving recipe image with multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const path = './uploads/recipe_images';
        // create directory if it doesn't exist
        fs.mkdirSync(path, { recursive: true })

        cb(null, path);
    },
    filename: (req, file, cb) => {
        const extension = file.originalname.split('.')[1];

        // filename: <recipeId>.<originalExtension>
        cb(null, req.params.id + '.' + extension);
    },
})

// filter uploaded file before saving it with multer
const fileFilter = function (req, file, cb) {
    const allowedTypes = ["image/jpeg", "image/png"]; // allowed formats
    const fileSize = parseInt(req.headers["content-length"])

    req.fileValidationErrors = [];

    // check if file has correct format
    if(!allowedTypes.includes(file.mimetype)){
        req.fileValidationErrors.push('Incorrect file type.');
    }

    // check if file is larger than 1MB
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

// uploads file based on the previously set options
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


// deletes file from the recipe_images directory that has the given recipeId as their filename
const deleteImage = async function (req, res, next){
    const directory = "./uploads/recipe_images/"
    const files =  await fsPromise.readdir(directory);

    fs.mkdirSync(directory, { recursive: true })

    for(const file of files){
        if(file.split('.')[0] === String(req.params.id)){
            await fs.unlinkSync(directory + file);
            break;
        }
    }

    next();
}

// create new recipe for current user
router.post('/create', authMiddleware, recipeController.createOne);
// upload new image for recipe by recipeId
router.post('/uploadImage/:id', authMiddleware, deleteImage, uploadFile, recipeController.uploadImage);
// edit recipe of current user by recipeId
router.post('/edit/:id', authMiddleware, recipeController.editRecipeOfCurrentUser);
// delete recipe of current user by recipeId
router.get('/delete/:id', authMiddleware, recipeController.deleteRecipeOfCurrentUser);

// get recipe by recipeId
router.get('/recipeById/:id', recipeController.getRecipeById);
// get recipe image by filename
router.get('/recipeImage/:filename', recipeController.getRecipeImage);
// get count of all recipes
router.get('/allRecipeCount', recipeController.getAllRecipeCount);
// get all recipe cards, paginated
router.get('/getAllCardsWithPagination/:page', recipeController.getAllRecipeCardsWithPagination);
// get filtered recipe cards, sorted, paginated
router.post('/getFilteredCards/:sortBy/:page', recipeController.getFilteredRecipeCards);

// get comments by recipeId, paginated
router.get('/comment/get/byRecipeId/:recipeId/:page', recipeController.getCommentsByRecipeId);
// get comment count of recipe by recipeId
router.get('/comment/count/:recipeId', recipeController.getCommentCountById);
// get average rating of recipe by recipeId
router.get('/averageRating/:recipeId', recipeController.getAverageRatingById);

// add comment of current user to recipe
router.post('/comment/add', authMiddleware, recipeController.addComment);
// edit comment of current user by commentId
router.post('/comment/edit/:id', authMiddleware, recipeController.editComment);
// delete comment of current user by commentId
router.get('/comment/delete/:id', authMiddleware, recipeController.deleteComment);
// get comment of current user by recipeId
router.get('/comment/get/currentUser/:recipeId', authMiddleware, recipeController.getCommentOfCurrentUserByRecipeId);

// get all difficulties
router.get('/difficulties', recipeController.getAllDifficulties);
// get all costs
router.get('/costs', recipeController.getAllCosts);
// get all units
router.get('/units', recipeController.getAllUnits);
// get all recipe categories
router.get('/categories', recipeController.getAllCategories);
// get all diets
router.get('/diets', recipeController.getAllDiets);
// get all allergens
router.get('/allergens', recipeController.getAllAllergens);

// add new unit as admin
router.post('/admin/units/add', adminAuthMiddleware, recipeController.addUnit);
// edit unit by unitId as admin
router.post('/admin/units/edit/:id', adminAuthMiddleware, recipeController.editUnit);
// delete unit by unitId as admin
router.get('/admin/units/delete/:id', adminAuthMiddleware, recipeController.deleteUnit);

// add new recipe category as admin
router.post('/admin/categories/add', adminAuthMiddleware, recipeController.addCategory);
// edit recipe category by categoryId as admin
router.post('/admin/categories/edit/:id', adminAuthMiddleware, recipeController.editCategory);
// delete recipe category by categoryId as admin
router.get('/admin/categories/delete/:id', adminAuthMiddleware, recipeController.deleteCategory);
// get ranked categories as admin, paginated
router.get('/admin/categories/ranked/:page', adminAuthMiddleware, recipeController.getRankedCategories);
// get count of all recipe categories as admin
router.get('/admin/categories/count', adminAuthMiddleware, recipeController.getCategoriesCount);

// add new diet as admin
router.post('/admin/diets/add', adminAuthMiddleware, recipeController.addDiet);
// edit diet by dietId as admin
router.post('/admin/diets/edit/:id', adminAuthMiddleware, recipeController.editDiet);
// delete diet by dietId as admin
router.get('/admin/diets/delete/:id', adminAuthMiddleware, recipeController.deleteDiet);

// add new allergen as admin
router.post('/admin/allergens/add', adminAuthMiddleware, recipeController.addAllergen);
// edit allergen by allergenId as admin
router.post('/admin/allergens/edit/:id', adminAuthMiddleware, recipeController.editAllergen);
// delete allergen by allergenId as admin
router.get('/admin/allergens/delete/:id', adminAuthMiddleware, recipeController.deleteAllergen);

// get all recipes as admin, sorted, paginated
router.post('/admin/all/:sortBy/:page', adminAuthMiddleware, recipeController.getAllRecipes);
// get count of all recipes as admin
router.post('/admin/all/count', adminAuthMiddleware, recipeController.getAllAdminPageRecipesCount);
// edit recipe by recipeId as admin
router.post('/admin/edit/:id', adminAuthMiddleware, recipeController.editRecipeAdmin);
// delete recipe by recipeId as admin
router.get('/admin/delete/:id', adminAuthMiddleware, recipeController.deleteRecipeAdmin);

// get all comments as admin, sorted, paginated
router.post('/admin/comment/all/:sortBy/:page', adminAuthMiddleware, recipeController.getAllComments);
// get count of all comments as admin
router.post('/admin/comment/count', adminAuthMiddleware, recipeController.getAllAdminPageCommentsCount);
// edit comment by commentId as admin
router.post('/admin/comment/edit/:id', adminAuthMiddleware, recipeController.editCommentAdmin);
// delete comment by commentId as admin
router.get('/admin/comment/delete/:id', adminAuthMiddleware, recipeController.deleteCommentAdmin);


module.exports = router;