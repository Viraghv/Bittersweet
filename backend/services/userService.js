const BadRequest = require("../exceptions/BadRequest");
const userRepository = require("../repositories/userRepository");
const bcrypt = require('bcrypt');
const NotFound = require("../exceptions/NotFound");


module.exports.register = (userData) => {
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
        return userRepository.createUser(userData);
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
        if(await bcrypt.compare(loginData.password, user.password)){
            return user.id;
        }
        throw new NotFound(["Invalid username or password."])
    } catch (exception){
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

    for (let i = 0; i < user.allergies.length; i++) {
        userAllergies.push(user.allergies[i].allergen)
    }

    user.allergies = userAllergies;

    return user;
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

module.exports.changePasswordOfCurrentUser = async (passwordData, userId) => {
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

    if(!userData.username?.trim() || !userData.email?.trim()){
        errors.push("Please fill in the username and email fields.");
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
        return userRepository.editProfileOfUser(userData, userId)
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