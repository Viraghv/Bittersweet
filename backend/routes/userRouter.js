const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/auth');
const adminAuthMiddleware = require('../middlewares/adminAuth');
const multer = require("multer");
const {session} = require("../session/sessionStorage");
const fs = require("fs");
const {promises: fsPromise} = require("fs");

// set destination and filename to saving user profile picture with multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const path = './uploads/pfps';
        // create directory if it doesn't exist
        fs.mkdirSync(path, { recursive: true })

        cb(null, path);
    },
    filename: (req, file, cb) => {
        const extension = file.originalname.split('.')[1];

        let userId;
        if(req.params.id){
            userId = Number(req.params.id);
        } else {
            let sessionToken = req.headers.authorization
            userId = session[sessionToken].userId;
        }

        // filename: <userId>.<originalExtension>
        cb(null, userId + '.' + extension);
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
});

// uploads file based on the previously set options
const uploadFile = function (req, res, next) {
    const upload = multerUpload.single('image');

    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            console.log("MulterError occurred: ");
            console.log(err);
        } else if (err) {
            console.log("Unknown error occurred: ");
            console.log(err);
        }
        next()
    })
}

// deletes file from the pfps directory that has the given userId as their filename
const deleteImage = async function (req, res, next){
    if(req.body?.deletePfp !== false) {
        let userId;
        if(req.params.id){
            userId = Number(req.params.id);
        } else {
            let sessionToken = req.headers.authorization
            userId = session[sessionToken].userId;
        }

        const directory = "./uploads/pfps/"
        fs.mkdirSync(directory, { recursive: true })

        const files = await fsPromise.readdir(directory);

        for(const file of files){
            if(file.split('.')[0] === String(userId)){
                await fs.unlinkSync(directory + file);
                break;
            }
        }
    }

    next();
}

// register new user
router.post('/register', userController.register);

// log in as existing user
router.post('/login', userController.login);
// log out current user
router.get('/logout', userController.logout);

// verify email of user
router.get('/verification/:token', userController.verification);
// generate new password for user and send it to their email address
router.post('/forgotPassword', userController.forgotPassword);

// get data of current user
router.get('/getCurrentUser', authMiddleware, userController.getCurrentUser);
// get admin attribute of current user
router.get('/isAdmin', authMiddleware, userController.isCurrentUserAdmin);
// get user's uploaded recipe count by userId
router.get('/uploadedRecipeCount/:id', userController.getUploadedRecipeCountById);
// get profile picture by filename
router.get('/pfp/:filename', userController.getPfp);
// get all recipeIds that current user has commented on
router.get('/currentUserAllRecipesWithComments', authMiddleware, userController.getCurrentUserAllRecipesWithComments);
// get all recipeIds of recipes uploaded by current user
router.get('/currentUserAllRecipeIds', authMiddleware, userController.getCurrentUserAllRecipeIds);
// get all recipe cards of recipes uploaded by current user, sorted and paginated
router.get('/currentUserAllRecipeCards/:sortBy/:page', authMiddleware, userController.getCurrentUserAllRecipeCards);

// change password of current user
router.post('/edit/password', authMiddleware, userController.changePasswordOfCurrentUser);
// edit profile data of current user
router.post('/edit/profile', authMiddleware, deleteImage, userController.editProfileOfCurrentUser);
// upload profile picture for current user
router.post('/edit/uploadImage', authMiddleware, deleteImage, uploadFile, userController.uploadImageForCurrentUser);
// edit weekly menu preferences of current user
router.post('/edit/preferences', authMiddleware, userController.editPreferencesCurrentUser);

// get user data by userId as admin
router.get('/admin/getUser/:id', adminAuthMiddleware, userController.getUserAdmin);
// get all users as admin, filtered, sorted and paginated
router.post('/admin/all/:sortBy/:page', adminAuthMiddleware, userController.getAllUsers);
// get number of all registered users as admin
router.post('/admin/all/count', adminAuthMiddleware, userController.getAllUsersCount);
// edit profile of user by userId as admin
router.post('/admin/edit/profile/:id', adminAuthMiddleware, deleteImage, userController.editProfileAdmin);
// upload profile picture for user by userId as admin
router.post('/admin/edit/uploadImage/:id', adminAuthMiddleware, deleteImage, uploadFile, userController.uploadImageAdmin);
// change password of user by userId as admin
router.post('/admin/edit/password/:id', adminAuthMiddleware, userController.changePasswordOfUserAdmin);
// set verified attribute of user by userId as admin
router.post('/admin/edit/setVerified/:id', adminAuthMiddleware, userController.setVerifiedAdmin);
// set admin attribute of user by userId as admin
router.post('/admin/edit/setAdmin/:id', adminAuthMiddleware, userController.setAdmin);
// delete user by userId as admin
router.get('/admin/delete/:id', adminAuthMiddleware, deleteImage, userController.deleteUserAdmin);

// get user ranking as admin
router.get('/admin/ranked/:page', adminAuthMiddleware, userController.getRankedUsers);
// get count of all verified users
router.get('/admin/allUserCount/verified', adminAuthMiddleware, userController.getAllVerifiedUserCount);

// is current user logged in
router.get("/isLoggedIn", authMiddleware, userController.isLoggedIn);
// refresh session token of current user
router.get("/refreshToken", authMiddleware, userController.refreshToken);

module.exports = router;
