const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const authMiddleware = require('../middlewares/auth');
const multer = require("multer");
const {session} = require("../session/sessionStorage");
const fs = require("fs");
const {promises: fsPromise} = require("fs");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/pfps');
    },
    filename: (req, file, cb) => {
        const extention = file.originalname.split('.')[1];
        let sessionToken = req.headers.authorization
        let userId = session[sessionToken].userId;

        cb(null, userId + '.' + extention);
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
});

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
    let sessionToken = req.headers.authorization
    let userId = session[sessionToken].userId;

    const directory = "./uploads/pfps/"
    const files =  await fsPromise.readdir(directory);

    for(const file of files){
        if(file.split('.')[0] === String(userId)){
            await fs.unlinkSync(directory + file);
            break;
        }
    }

    next();
}


router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/logout', userController.logout);

router.get('/verification/:token', userController.verification);
router.post('/forgotPassword', userController.forgotPassword);

router.get('/getCurrentUser', authMiddleware, userController.getCurrentUser)
router.get('/uploadedRecipeCount/:id', userController.getUploadedRecipeCountById)
router.get('/pfp/:filename', userController.getPfp)
router.get('/currentUserAllRecipesWithComments', authMiddleware, userController.getCurrentUserAllRecipesWithComments)
router.get('/currentUserAllRecipeIds', authMiddleware, userController.getCurrentUserAllRecipeIds)
router.get('/currentUserAllRecipeCards/:sortBy/:page', authMiddleware, userController.getCurrentUserAllRecipeCards)

router.post('/edit/password', authMiddleware, userController.changePasswordOfCurrentUser)
router.post('/edit/profile', authMiddleware, userController.editProfileOfCurrentUser)
router.post('/edit/uploadImage', authMiddleware, deleteImage, uploadFile, userController.uploadImageForCurrentUser)
router.post('/edit/preferences', authMiddleware, userController.editPreferencesCurrentUser)

router.post('/groups/createForCurrentUser', authMiddleware, userController.createGroupForCurrentUser)
router.post('/groups/edit', authMiddleware, userController.editNameOfGroup)
router.get('/groups/delete/:id', authMiddleware, userController.deleteGroup)
router.get('/groups/allCurrentUser', authMiddleware, userController.getAllGroupsOfCurrentUser)
router.get('/groups/allOfRecipeAndUser/:id', authMiddleware, userController.getAllGroupsOfFavourite)
router.post('/groups/addRecipe', authMiddleware, userController.addRecipeToGroup)
router.post('/groups/deleteRecipe', authMiddleware, userController.deleteRecipeFromGroup)
router.get('/groups/getAllRecipeCards/:sortBy/:id/:page', authMiddleware, userController.getAllRecipeCardsOfGroup)
router.get('/groups/recipeCount/:id', authMiddleware, userController.getRecipeCountOfGroup)

router.get("/getSessionState", authMiddleware, userController.getSessionState);
router.get("/isLoggedIn", authMiddleware, userController.isLoggedIn);
router.get("/refreshToken", authMiddleware, userController.refreshToken)

module.exports = router;
