const BadRequest = require("../exceptions/BadRequest");
const userRepository = require("../repositories/userRepository");
const bcrypt = require('bcrypt');
const NotFound = require("../exceptions/NotFound");
const weeklyMenuService = require("./weeklyMenuService");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const NotAuthorized = require("../exceptions/NotAuthorized");
const {TokenExpiredError} = require("jsonwebtoken");

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
});

const EMAIL_SECRET = "ahw58zfdlcj4nvjrlsjvir6lvakdn5vrk5fvlg4847"

module.exports.register = async (userData) => {
    const errors = [];

    if(!userData.username?.trim() || !userData.email?.trim() ||
       !userData.password?.trim() || !userData.passwordAgain?.trim()){
        errors.push("Please fill in all fields");
    }

    if(userData.username?.trim().length > 100) {
        errors.push("Username can't be longer than 100 characters");
    }

    if(userData.email?.trim().length > 100) {
        errors.push("Email can't be longer than 100 characters");
    }

    if(userData.email?.trim() &&
        !userData.email?.toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)){
        errors.push("Invalid email");
    }

    if(userData.password?.trim() !== "" && userData.password?.trim().length < 6){
        errors.push("Password must be at least 6 characters long")
    }

    if(userData.password !== userData.passwordAgain){
        errors.push("Passwords do not match");
    }

    if(errors.length > 0){
        throw new BadRequest(errors);
    }

    delete userData.passwordAgain;

    try {
        let user = await userRepository.createUser(userData);

        jwt.sign(
            {
                user: user.id,
            },
            EMAIL_SECRET,
            {
                expiresIn: 15 * 60,  //15 minutes
            },
            (err, emailToken) => {
                const url = `http://bittersweet.local/verification/${emailToken}`;

                transporter.sendMail({
                    to: user.email,
                    subject: 'Bittersweet - Email Verification',
                    html: `<div style="background-color: #E8EDDF; font-size: 1.2rem; text-align: center; display: inline-block; margin-left: auto; margin-right: auto; padding: 20px 40px">
Welcome to <b>Bittersweet!</b><br><br>\n
Thank you for your registration.<br>
To verify your account, please click <b><a href="${url}">here.</a></b><br><br>

Thank you, <br>\n
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

module.exports.login = async (loginData) => {
    if(!loginData.username?.trim() || !loginData.password?.trim()){
        throw new BadRequest(["Please fill in all fields"]);
    }

    try {
        let user = await userRepository.getUserByUsername(loginData.username);

        if(!(await bcrypt.compare(loginData.password, user.password))){
            throw new NotFound(["Invalid username or password."])
        }

        if(!user.emailVerified){
            throw new NotAuthorized(["Please verify your email address."])

        }

        return user.id;

    } catch (exception){
        throw exception
    }
}

module.exports.verification = async (token) => {
    try {
        const userId = jwt.verify(token, EMAIL_SECRET).user;
        await userRepository.verifyEmailByUserId(userId);

        await weeklyMenuService.generateWeekForUser(userId, 0);
        await weeklyMenuService.generateWeekForUser(userId, 1);

        return "Successfull verification."
    } catch (error) {
        if (error instanceof TokenExpiredError) {
            try {
                const userId = jwt.verify(token, EMAIL_SECRET, {ignoreExpiration: true}).user;
                await this.deleteVerifiedUserById(userId);
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

module.exports.forgotPassword = async (email) => {
    try {
        let newPassword = makePassword(16);

        await userRepository.updatePassword(email, newPassword);

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

module.exports.deleteUserById = async (userId) => {
    try {
        await userRepository.deleteUserById(userId);
    } catch (exception) {
        console.log(exception);
        throw exception
    }
}

module.exports.deleteVerifiedUserById = async (userId) => {
    try {
        await userRepository.deleteVerifiedUserById(userId);
    } catch (exception) {
        console.log(exception);
        throw exception
    }
}

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

module.exports.createGroupForCurrentUser = async (name, userId) => {
    if(name.trim() === ""){
        throw new BadRequest(["Please provide a name for the group."]);
    }

    if(name.trim().length > 100){
        throw new BadRequest(["Group name can't be longer than 100 characters."]);
    }

    try {
        return await userRepository.createGroupForCurrentUser(name, userId);
    } catch (exception) {
        console.log(exception);
        throw exception
    }
}

module.exports.getUserById = async (userId) => {
    let user;

    try {
        user = await userRepository.getUserById(userId);
    } catch (exception) {
        console.log(exception);
        throw exception
    }

    let userAllergies = [];

    for (let i = 0; i < user?.allergies.length; i++) {
        userAllergies.push(user.allergies[i].allergen)
    }

    if(user){
        user.allergies = userAllergies;
    }

    return user;
}

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

module.exports.getUsersAllRecipesWithCommentsById = async (userId) => {
    let recipeIds;

    try {
        recipeIds = await userRepository.getUsersAllRecipesWithCommentsById(userId);
    } catch (exception) {
        console.log(exception);
        throw exception
    }

    let recipeIdsArray = [];

    for (let i = 0; i < recipeIds.length; i++) {
        recipeIdsArray.push(recipeIds[i].recipeId);
    }

    return recipeIdsArray;
}

module.exports.getUsersAllRecipeIds = async (userId) => {
    let recipeIds;

    try {
        recipeIds = await userRepository.getUsersAllRecipeIds(userId);
    } catch (exception) {
        console.log(exception);
        throw exception
    }

    let recipeIdsArray = [];

    for (let i = 0; i < recipeIds.length; i++) {
        recipeIdsArray.push(recipeIds[i].id);
    }

    return recipeIdsArray;
}

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

module.exports.getAllUserCount = async () => {
    let userCount;

    try {
        userCount = await userRepository.getAllUserCount();
    } catch (exception) {
        console.log(exception);
        throw exception
    }

    return userCount;
}

module.exports.getAllActiveUserCount = async () => {
    let activeUserCount;

    try {
        activeUserCount = await userRepository.getAllActiveUserCount();
    } catch (exception) {
        console.log(exception);
        throw exception
    }

    return activeUserCount;
}

module.exports.changePasswordOfUser = async (passwordData, userId) => {
    const errors = []

    if(!passwordData.currentPassword?.trim() || !passwordData.newPassword?.trim()){
       errors.push("Please fill in all fields.");
    }

    if(passwordData.newPassword?.trim().length < 6){
        errors.push("Password must be at least 6 characters long.");
    }

    if(errors.length > 0){
        throw new BadRequest(errors);
    }

    try {
        let password = await userRepository.getUserPasswordById(userId);
        if(await bcrypt.compare(passwordData.currentPassword, password)){
            return await userRepository.changePassword(passwordData.newPassword, userId)
        }
        throw new NotFound(["Invalid current password."])
    } catch (exception){
        throw exception
    }
}

module.exports.editProfileOfUser = async (userData, userId) => {
    const errors = []

    if(!userData.username?.trim()){
        errors.push("Please fill in the username field.");
    }

    if(userData.username?.trim().length > 100) {
        errors.push("Username can't be longer than 100 characters.");
    }

    if(userData.firstname?.trim().length > 100){
        errors.push("First name can't be longer than 100 characters.");
    }

    if(userData.lastname?.trim().length > 100){
        errors.push("Last name can't be longer than 100 characters.");
    }

    if(errors.length > 0){
        throw new BadRequest(errors);
    }

    try {
        return userRepository.editProfileOfUser(userData, userId)
    } catch (exception){
        throw exception
    }
}

module.exports.editProfileOfUserAdmin = async (userData, userId) => {
    const errors = []

    if(!userData.username?.trim() || !userData.email?.trim()){
        errors.push("Please fill in the username field.");
    }

    if(userData.username?.trim().length > 100) {
        errors.push("Username can't be longer than 100 characters.");
    }

    if(userData.username?.trim().length > 100) {
        errors.push("Username can't be longer than 100 characters.");
    }

    if(userData.email?.trim().length > 100) {
        errors.push("Email can't be longer than 100 characters.");
    }

    if(userData.email?.trim() &&
        !userData.email?.toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)){
        errors.push("Invalid email.");
    }

    if(userData.firstname?.trim().length > 100){
        errors.push("First name can't be longer than 100 characters.");
    }

    if(userData.lastname?.trim().length > 100){
        errors.push("Last name can't be longer than 100 characters.");
    }

    if(errors.length > 0){
        throw new BadRequest(errors);
    }

    try {
        return userRepository.editProfileOfUserAdmin(userData, userId)
    } catch (exception){
        throw exception
    }
}

module.exports.uploadImage = async (image, userId) => {
    try {
        return userRepository.uploadImage(image, userId);
    } catch (exception){
        console.log(exception);
        throw exception
    }
}

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

module.exports.getAllGroupsOfUserById = async (userId) => {
    let userGroups;

    try {
        userGroups = await userRepository.getAllGroupsOfUserById(userId);
    } catch (exception) {
        console.log(exception);
        throw exception
    }

    return userGroups;
}

module.exports.getAllGroupsOfFavouriteById = async (recipeId, userId) => {
    let userGroups;

    try {
        userGroups = await userRepository.getAllGroupsOfFavouriteById(recipeId, userId);
    } catch (exception) {
        console.log(exception);
        throw exception
    }

    for (let i = 0; i < userGroups.length; i++) {
       userGroups[i] = userGroups[i].recipeGroup;
    }

    return userGroups;
}

module.exports.addRecipeToGroup = async (data) => {
    try {
        await userRepository.addRecipeToGroup(data);
    } catch (exception) {
        console.log(exception);
        throw exception
    }
}

module.exports.editNameOfGroup = async (groupId, newName, userId) => {
    if(newName.trim() === ""){
        throw new BadRequest(["Please provide a name for the group."]);
    }

    if(newName.trim().length > 100){
        throw new BadRequest(["Group name can't be longer than 100 characters."]);
    }

    try {
        await userRepository.editNameOfGroup(groupId, newName, userId);
    } catch (exception) {
        console.log(exception);
        throw exception
    }
}

module.exports.deleteGroup = async (groupId, userId) => {
    try {
        await userRepository.deleteGroup(groupId, userId);
    } catch (exception) {
        console.log(exception);
        throw exception
    }
}

module.exports.deleteRecipeFromGroup = async (groupId, recipeId, userId) => {
    try {
        await userRepository.deleteRecipeFromGroup(groupId, recipeId, userId);
    } catch (exception) {
        console.log(exception);
        throw exception
    }
}

module.exports.deleteRecipeFromGroups = async (recipeId, userGroups) => {
    try {
        let userGroupIds = [];

        for (let i = 0; i < userGroups.length; i++) {
            userGroupIds.push(userGroups[i].id)
        }

        await userRepository.deleteRecipeFromGroups(recipeId, userGroupIds);
    } catch (exception) {
        console.log(exception);
        throw exception
    }
}

module.exports.getAllRecipeCardsOfGroup = async (sortBy, groupId, page, userId) => {
    let recipeCards = [];

    try {
        recipeCards = await userRepository.getAllRecipeCardsOfGroup(sortBy, groupId, page, userId);
    } catch (exception) {
        console.log(exception);
        throw exception
    }

    for (let i = 0; i < recipeCards.length; i++) {
        recipeCards[i] = recipeCards[i].recipe;
    }

    return recipeCards;
}

module.exports.getRecipeCountOfGroup = async (groupId, userId) => {
    let recipeCount = 0;

    try {
        recipeCount = await userRepository.getRecipeCountOfGroup(groupId, userId);
    } catch (exception) {
        console.log(exception);
        throw exception
    }

    return recipeCount;
}

module.exports.getAllUserIds = async () => {
    let userIds;

    try {
        userIds = await userRepository.getAllUserIds();

        for (let i = 0; i < userIds.length; i++) {
            userIds[i] = userIds[i].id;
        }

    } catch (exception) {
        console.log(exception);
        throw exception
    }

    return userIds;
}

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

module.exports.changePasswordOfUserAdmin = async (passwordData, userId) => {
    const errors = []

    if(!passwordData.newPassword?.trim()){
        errors.push("Please fill in all fields.");
    }

    if(passwordData.newPassword?.trim().length < 6){
        errors.push("Password must be at least 6 characters long.");
    }

    if(errors.length > 0){
        throw new BadRequest(errors);
    }

    try {
        return await userRepository.changePassword(passwordData.newPassword, userId)
    } catch (exception){
        throw exception
    }
}

module.exports.setVerified = async (verified, userId) => {
    try {
        return await userRepository.setVerified(verified, userId)
    } catch (exception){
        throw exception
    }
}

module.exports.setAdmin = async (admin, userId) => {
    try {
        return await userRepository.setAdmin(admin, userId)
    } catch (exception){
        throw exception
    }
}

module.exports.getRankedUsers = async (page) => {
    let rankedUsers = [];

    try {
        rankedUsers = await userRepository.getRankedUsers();

        rankedUsers.sort((a, b) => ((b._count.recipes + b._count.comments) - (a._count.recipes + a._count.comments)));

    } catch (error) {
        console.log(error);
        throw error;
    }

    rankedUsers = rankedUsers.slice((page-1) * 25, page * 25);

    for (let i = 0; i < rankedUsers.length; i++) {
        rankedUsers[i].recipeCount = rankedUsers[i]._count.recipes;
        rankedUsers[i].commentsCount = rankedUsers[i]._count.comments;
        delete rankedUsers[i]._count;
    }


    return rankedUsers;
}

function makePassword(length) {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}