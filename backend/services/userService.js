const BadRequest = require("../exceptions/BadRequest");
const userRepository = require("../repositories/userRepository");
const bcrypt = require('bcrypt');
const NotFound = require("../exceptions/NotFound");
const weeklyMenuService = require("./weeklyMenuService");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const Unauthorized = require("../exceptions/Unauthorized");
const {TokenExpiredError} = require("jsonwebtoken");

// transporter object for sending emails with nodemailer
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
});

// email secret for jwt encryption
const EMAIL_SECRET = "ahw58zfdlcj4nvjrlsjvir6lvakdn5vrk5fvlg4847"

// regex for email address validation
const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

/**
 * Service function for registering a new user.
 * Validates user data before creating new user, then generates JWT of user's userId and sends verification link to user's
 * email address.
 * @param userData registration data of new user
 * @returns userId of new user
 */
module.exports.register = async (userData) => {
    const errors = [];

    // are all fields filled
    if(!userData.username?.trim() || !userData.email?.trim() ||
       !userData.password?.trim()){
        errors.push("Please fill in all fields");
    }

    // is username longer than 100 characters
    if(userData.username?.trim().length > 100) {
        errors.push("Username can't be longer than 100 characters");
    }

    // is email longer than 256 characters
    if(userData.email?.trim().length > 256) {
        errors.push("Email can't be longer than 256 characters");
    }

    // does email address fit email regex
    if(userData.email?.trim() &&
        !userData.email?.toLowerCase().match(EMAIL_REGEX)){
        errors.push("Invalid email");
    }

    // is password shorter than 6 characters
    if(userData.password?.trim() !== "" && userData.password?.trim().length < 6){
        errors.push("Password must be at least 6 characters long")
    }

    if(errors.length > 0){
        throw new BadRequest(errors);
    }

    try {
        // create new user
        let user = await userRepository.createUser(userData);

        // generate jwt of userId
        jwt.sign(
            {
                user: user.id,
            },
            EMAIL_SECRET,
            {
                expiresIn: 15 * 60,  //15 minutes
            },
            (err, emailToken) => {
                // construct verification link
                const url = `${process.env.CLIENT_REQUEST_URL}/verification/${emailToken}`;

                // send verification email
                transporter.sendMail({
                    to: user.email,
                    subject: 'Bittersweet - Email Verification',
                    html:
                        `<div style="background-color: #E8EDDF; font-size: 1.2rem; text-align: center; display: inline-block; margin-left: auto; margin-right: auto; padding: 20px 40px">
                            Welcome to <b>Bittersweet!</b><br><br>
                            Thank you for your registration.<br>
                            To verify your account, please click <b><a href="${url}">here.</a></b><br><br>
                            
                            Thank you, <br>
                            Bittersweet
                        </div>`
                });
            },
        );

        return user.id;
    } catch (exception){
        throw exception
    }
}

/**
 * Service function for logging in as an existing user.
 * Validates login data and checks if it fits an existing user's username and password.
 * @param loginData login data of user trying to log in (username, password)
 * @returns userId of user to log in
 */
module.exports.login = async (loginData) => {
    // are all login fields filled
    if(!loginData.username?.trim() || !loginData.password?.trim()){
        throw new BadRequest(["Please fill in all fields"]);
    }

    try {
        // get user by username
        let user = await userRepository.getUserByUsername(loginData.username);

        // compare given password and stored password
        if(!(await bcrypt.compare(loginData.password, user.password))){
            throw new NotFound(["Invalid username or password."])
        }

        // is user's email address verified
        if(!user.emailVerified){
            throw new Unauthorized(["Please verify your email address."])

        }

        return user.id;
    } catch (exception){
        throw exception
    }
}

/**
 * Service function for verifying email of user by their generated JWT.
 * Get userId from JWT if token is valid, then change their status to verified.
 * If email verification was successful, generate weekly menu for user.
 * If token has already expired, deletes user, so they can register again.
 * @param token verification JWT token
 * @returns message about successful verification
 */
module.exports.verification = async (token) => {
    try {
        // validate token and get userId from it
        const userId = jwt.verify(token, EMAIL_SECRET).user;
        // verify user in database
        await userRepository.verifyEmailByUserId(userId);

        // generate weekly menu for user
        await weeklyMenuService.generateWeekForUser(userId, 0);
        await weeklyMenuService.generateWeekForUser(userId, 1);

        return "Successfull verification."
    } catch (error) {
        // if token has expired
        if (error instanceof TokenExpiredError) {
            try {
                // get userId from token
                const userId = jwt.verify(token, EMAIL_SECRET, {ignoreExpiration: true}).user;
                // delete user
                await this.deleteUnverifiedUserById(userId);
            } catch (error2) {
                console.log(error2);
                throw error2;
            }
            throw new BadRequest(["Verification link has expired."])
        } else {
            console.log(error);
            throw error;
        }
    }
}

/**
 * Service function for generating new password for user and sending it to their email address.
 * Generates new password for user with given email and send it to that address.
 * @param email email of user to send new password to
 */
module.exports.forgotPassword = async (email) => {
    try {
        // generate new password
        let newPassword = makePassword(16);

        // change user's password in database
        await userRepository.updatePassword(email, newPassword);

        // send email to user's address with the new password
        transporter.sendMail({
            to: email,
            subject: 'Bittersweet - Forgotten Password',
            html: `<div style="background-color: #E8EDDF; font-size: 1.2rem; text-align: center; display: inline-block; margin-left: auto; margin-right: auto; padding: 20px 40px">
You have recieved this email because you've asked for a new password on <b>Bittersweet</b>.<br><br>\n
Your new password is: <b>${newPassword}</b><br>
Please change this password as soon as possible.<br><br>

Thank you, <br>\n
Bittersweet    
</div>`
        });

    } catch (exception) {
        console.log(exception);
        throw exception
    }
}

/**
 * Deletes user by userId if user's email is unverified.
 * @param userId userId of user
 */
module.exports.deleteUnverifiedUserById = async (userId) => {
    try {
        await userRepository.deleteUnverifiedUserById(userId);
    } catch (exception) {
        console.log(exception);
        throw exception
    }
}

/**
 * Service function for getting data of user by userId.
 * Converts user data to desired format after getting it.
 * @param userId userId of user to get
 * @returns user data of given user
 */
module.exports.getUserById = async (userId) => {
    let user;

    try {
        user = await userRepository.getUserById(userId);
    } catch (exception) {
        console.log(exception);
        throw exception
    }

    // convert allergies array to a more intuitive form
    let userAllergies = [];
    for (let i = 0; i < user?.allergies.length; i++) {
        userAllergies.push(user.allergies[i].allergen)
    }

    if(user){
        user.allergies = userAllergies;
    }

    return user;
}

/**
 * Service function for getting admin attribute of user.
 * @param userId userId of user
 * @returns admin attribute of given user
 */
module.exports.isAdmin = async (userId) => {
    let user;

    try {
        user = await userRepository.isAdmin(userId);
    } catch (exception) {
        console.log(exception);
        throw exception
    }

    return user.admin;
}

/**
 * Service function for getting user's uploaded recipe count by userId.
 * @param userId userId of user
 * @returns number of given user's uploaded recipes
 */
module.exports.getUploadedRecipeCountById = async (userId) => {
    let recipeCount;

    try {
        recipeCount = await userRepository.getUploadedRecipeCountById(userId);
    } catch (exception) {
        console.log(exception);
        throw exception
    }

    return recipeCount;
}

/**
 * Service function for getting all recipeIds that user has commented on.
 * Converts received data to the desired format.
 * @param userId userId of user
 * @returns array of recipeIds of recipes the user has commented on
 */
module.exports.getUsersAllRecipesWithCommentsById = async (userId) => {
    let recipeIds;

    try {
        recipeIds = await userRepository.getUsersAllRecipesWithCommentsById(userId);
    } catch (exception) {
        console.log(exception);
        throw exception
    }

    // convert recipeIds array to a more intuitive form
    let recipeIdsArray = [];
    for (let i = 0; i < recipeIds.length; i++) {
        recipeIdsArray.push(recipeIds[i].recipeId);
    }

    return recipeIdsArray;
}

/**
 * Service function for getting all recipeIds of recipes uploaded by user.
 * Converts received data to the desired format.
 * @param userId
 * @returns {Promise<*[]>}
 */
module.exports.getUsersAllRecipeIds = async (userId) => {
    let recipeIds;

    try {
        recipeIds = await userRepository.getUsersAllRecipeIds(userId);
    } catch (exception) {
        console.log(exception);
        throw exception
    }

    // convert recipeIds array to a more intuitive form
    let recipeIdsArray = [];
    for (let i = 0; i < recipeIds.length; i++) {
        recipeIdsArray.push(recipeIds[i].id);
    }

    return recipeIdsArray;
}

/**
 * Service function for getting all recipe cards of recipes uploaded by user, sorted and paginated.
 * @param userId userId of user
 * @param sortBy sort cards by (options: nameAsc, nameDesc, uploadedAsc, uploadedDesc)
 * @param page page to get
 * @returns user's recipe cards of given page
 */
module.exports.getUsersAllRecipeCards = async (userId, sortBy, page) => {
    let recipeCards;

    try {
        recipeCards = await userRepository.getUsersAllRecipeCards(userId, sortBy, page);
    } catch (exception) {
        console.log(exception);
        throw exception
    }

    return recipeCards;
}

/**
 * Service function for changing password of user.
 * Validates new password and checks if user's current password fits the given current password before updating the new
 * password to the database.
 * @param passwordData data object of the current and new passwords
 * @param userId userId of user
 */
module.exports.changePasswordOfUser = async (passwordData, userId) => {
    const errors = []

    // are all fields filled
    if(!passwordData.currentPassword?.trim() || !passwordData.newPassword?.trim()){
       errors.push("Please fill in all fields.");
    }

    // is password shorter than 6 characters
    if(passwordData.newPassword?.trim().length < 6){
        errors.push("Password must be at least 6 characters long.");
    }

    if(errors.length > 0){
        throw new BadRequest(errors);
    }

    try {
        // does current password in database match the given current password
        let password = await userRepository.getUserPasswordById(userId);
        if(await bcrypt.compare(passwordData.currentPassword, password)){
            await userRepository.changePassword(passwordData.newPassword, userId)
        }
        throw new NotFound(["Invalid current password."])
    } catch (exception){
        throw exception
    }
}

/**
 * Service function for editing profile data of user.
 * Validates user data before calling repository.
 * @param userData object containing the data of the edited user
 * @param userId userId of user
 */
module.exports.editProfileOfUser = async (userData, userId) => {
    const errors = []

    // is the username field filled
    if(!userData.username?.trim()){
        errors.push("Please fill in the username field.");
    }

    // is the username longer than 100 characters
    if(userData.username?.trim().length > 100) {
        errors.push("Username can't be longer than 100 characters.");
    }

    // is the first name longer than 100 characters
    if(userData.firstname?.trim().length > 100){
        errors.push("First name can't be longer than 100 characters.");
    }

    // is the last name longer than 100 characters
    if(userData.lastname?.trim().length > 100){
        errors.push("Last name can't be longer than 100 characters.");
    }

    if(errors.length > 0){
        throw new BadRequest(errors);
    }

    try {
        await userRepository.editProfileOfUser(userData, userId)
    } catch (exception){
        throw exception
    }
}

/**
 * Service function for uploading profile picture for user.
 * @param image profile picture filename
 * @param userId userId of user
 */
module.exports.uploadImage = async (image, userId) => {
    try {
        await userRepository.uploadImage(image, userId);
    } catch (exception){
        console.log(exception);
        throw exception
    }
}

/**
 * Service function for editing weekly menu preferences of user.
 * After updating user preferences, regenerates user's weekly menu according to the new preferences.
 * @param prefData object of user's edited preferences
 * @param userId userId of user
 */
module.exports.editPreferencesOfUser = async (prefData, userId) => {
    try {
        await userRepository.editPreferencesOfUser(prefData, userId);

        await weeklyMenuService.generateWeekForUser(userId, 0);
        await weeklyMenuService.generateWeekForUser(userId, 1);
    } catch (exception) {
        console.log(exception);
        throw exception
    }
}

/**
 * Gets every verified user's userId.
 * Converts received data to the desired format.
 * @returns array of every verified user's userId.
 */
module.exports.getAllVerifiedUserIds = async () => {
    let userIds;

    try {
        userIds = await userRepository.getAllVerifiedUserIds();

        // convert userIds array to a more intuitive form
        for (let i = 0; i < userIds.length; i++) {
            userIds[i] = userIds[i].id;
        }

    } catch (exception) {
        console.log(exception);
        throw exception
    }

    return userIds;
}

/**
 * Service function for getting all users as admin, filtered, sorted, and paginated.
 * @param sortBy sort cards by (options: idAsc, idDesc, usernameAsc, usernameDesc, emailAsc, emailDesc, joinedAsc,
 * joinedDesc, statusAsc, statusDesc)
 * @param page page to get
 * @param searchData object containing the set filter options
 * @returns filtered user objects of given page, sorted
 */
module.exports.getAllUsers = async (sortBy, page, searchData) => {
    let users;

    try {
        users = await userRepository.getAllUsers(sortBy, page, searchData);
    } catch (exception) {
        console.log(exception);
        throw exception
    }

    return users;
}

/**
 * Service function for getting number of all registered users as admin.
 * @param searchData object containing the set filter options
 * @returns count of all registered users fitting the set filters
 */
module.exports.getAllUsersCount = async (searchData) => {
    let usersCount;

    try {
        usersCount = await userRepository.getAllUsersCount(searchData);
    } catch (exception) {
        console.log(exception);
        throw exception
    }

    return usersCount;
}

/**
 * Service function for editing profile of user by userId as admin.
 * Validates given profile data before calling repository.
 * @param userData object containing the data of the edited user profile
 * @param userId userId of user
 */
module.exports.editProfileAdmin = async (userData, userId) => {
    const errors = []

    // are all mandatory fields filled
    if(!userData.username?.trim() || !userData.email?.trim()){
        errors.push("Please fill in the username field.");
    }

    // is username longer than 100 characters
    if(userData.username?.trim().length > 100) {
        errors.push("Username can't be longer than 100 characters.");
    }

    // is email address longer than 100 characters
    if(userData.email?.trim().length > 100) {
        errors.push("Email can't be longer than 100 characters.");
    }

    // does email address fit email regex
    if(userData.email?.trim() &&
        !userData.email?.toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)){
        errors.push("Invalid email.");
    }

    // is first name longer than 100 characters
    if(userData.firstname?.trim().length > 100){
        errors.push("First name can't be longer than 100 characters.");
    }

    // is last name longer than 100 characters
    if(userData.lastname?.trim().length > 100){
        errors.push("Last name can't be longer than 100 characters.");
    }

    if(errors.length > 0){
        throw new BadRequest(errors);
    }

    try {
        await userRepository.editProfileAdmin(userData, userId)
    } catch (exception){
        throw exception
    }
}

/**
 * Service function for changing password of user by userId as admin.
 * Validates new password before calling repository.
 * @param passwordData object containing the new password
 * @param userId userId of user
 */
module.exports.changePasswordOfUserAdmin = async (passwordData, userId) => {
    const errors = []

    // are all fields filled
    if(!passwordData.newPassword?.trim()){
        errors.push("Please fill in all fields.");
    }

    // is password shorter than 6 characters
    if(passwordData.newPassword?.trim().length < 6){
        errors.push("Password must be at least 6 characters long.");
    }

    if(errors.length > 0){
        throw new BadRequest(errors);
    }

    try {
        await userRepository.changePassword(passwordData.newPassword, userId)
    } catch (exception){
        throw exception
    }
}

/**
 * Service function for setting verified attribute of user by userId as admin.
 * If verified attribute got set to true, generates weekly menu for user.
 * @param verified verified value to set (boolean)
 * @param userId userId of user
 */
module.exports.setVerified = async (verified, userId) => {
    try {
        await userRepository.setVerified(verified, userId);

        if(Boolean(verified)) {
            await weeklyMenuService.generateWeekForUser(userId, 0);
            await weeklyMenuService.generateWeekForUser(userId, 1);
        }
    } catch (exception){
        throw exception
    }
}

/**
 * Service function for setting admin attribute of user by userId as admin.
 * @param admin admin value set (boolean)
 * @param userId userId of user
 */
module.exports.setAdmin = async (admin, userId) => {
    try {
        await userRepository.setAdmin(admin, userId)
    } catch (exception){
        throw exception
    }
}

/**
 * Service function for deleting user by userId.
 * @param userId userId of user
 */
module.exports.deleteUserById = async (userId) => {
    try {
        await userRepository.deleteUserById(userId);
    } catch (exception) {
        console.log(exception);
        throw exception
    }
}

/**
 * Service function for getting user ranking as admin.
 * After getting aggregated data of all users from repository, sorts the user objects to get the ranking.
 * Slices out the given page from the ranking.
 * @param page page to get
 * @returns given page of ranked users
 */
module.exports.getRankedUsers = async (page) => {
    let rankedUsers = [];

    try {
        rankedUsers = await userRepository.getRankedUsers();

        // sort users based on how many recipes and comments they've uploaded
        rankedUsers.sort((a, b) => ((b._count.recipes + b._count.comments) - (a._count.recipes + a._count.comments)));

    } catch (error) {
        console.log(error);
        throw error;
    }

    // slices out given page
    rankedUsers = rankedUsers.slice((page-1) * 25, page * 25);

    // convert user objects array to a more intuitive form
    for (let i = 0; i < rankedUsers.length; i++) {
        rankedUsers[i].recipeCount = rankedUsers[i]._count.recipes;
        rankedUsers[i].commentsCount = rankedUsers[i]._count.comments;
        delete rankedUsers[i]._count;
    }

    return rankedUsers;
}

/**
 * Service function for getting count of all verified users.
 * @returns number of all verified users
 */
module.exports.getAllVerifiedUserCount = async () => {
    let activeUserCount;

    try {
        activeUserCount = await userRepository.getAllVerifiedUserCount();
    } catch (exception) {
        console.log(exception);
        throw exception
    }

    return activeUserCount;
}

/**
 * Deletes every unverified user whose account has been created more than 15 minutes ago.
 */
module.exports.deleteOldUnverifiedUsers = async () => {
    try {
        await userRepository.deleteOldUnverifiedUsers();
        console.log("Unverified users deleted.")
    } catch (error) {
        throw error;
    }
}

/**
 * Generates random password of given length.
 * @param length length of generated password
 * @returns {string} random password
 */
function makePassword(length) {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; // characters the password can contain
    let charactersLength = characters.length;
    // generate random password
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}