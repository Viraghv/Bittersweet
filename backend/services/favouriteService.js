const favouriteRepository = require('../repositories/favouriteRepository');
const BadRequest = require("../exceptions/BadRequest");


module.exports.addById = async (recipeId, userId) => {
    let favourite;

    try {
        favourite = await favouriteRepository.addById(recipeId, userId);
    } catch (exception) {
        console.log(exception);
        throw exception
    }

    return favourite;
}

module.exports.deleteById = async (recipeId, userId) => {
    try {
        await favouriteRepository.deleteById(recipeId, userId);
    } catch (exception) {
        console.log(exception);
        throw exception
    }
}

module.exports.getallUserFavourites = async (userId) => {
    let favourites = [];

    try {
        favourites = await favouriteRepository.getallUserFavourites(userId);
    } catch (exception) {
        console.log(exception);
        throw exception
    }

    let arrayFavourites = [];

    for (let i = 0; i < favourites.length; i++) {
        arrayFavourites.push(favourites[i].recipeId);
    }

    return arrayFavourites;
}

module.exports.getAllUserFavouriteCards = async (page, sortBy, userId) => {
    let favouriteCards = [];

    try {
        favouriteCards = await favouriteRepository.getAllUserFavouriteCards(page, sortBy, userId);
    } catch (exception) {
        console.log(exception);
        throw exception
    }

    for (let i = 0; i < favouriteCards.length; i++) {
        favouriteCards[i] = favouriteCards[i].recipe;
    }

    return favouriteCards;
}

module.exports.getAllUserFavouriteCount = async (userId) => {
    let favouritesCount = 0;

    try {
        favouritesCount = await favouriteRepository.getAllUserFavouriteCount(userId);
    } catch (exception) {
        console.log(exception);
        throw exception
    }

    return favouritesCount;
}


module.exports.createGroupForCurrentUser = async (name, userId) => {
    if(name.trim() === ""){
        throw new BadRequest(["Please provide a name for the group."]);
    }

    if(name.trim().length > 100){
        throw new BadRequest(["Group name can't be longer than 100 characters."]);
    }

    try {
        return await favouriteRepository.createGroupForCurrentUser(name, userId);
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
        await favouriteRepository.editNameOfGroup(groupId, newName, userId);
    } catch (exception) {
        console.log(exception);
        throw exception
    }
}

module.exports.deleteGroup = async (groupId, userId) => {
    try {
        await favouriteRepository.deleteGroup(groupId, userId);
    } catch (exception) {
        console.log(exception);
        throw exception
    }
}

module.exports.getAllGroupsOfUserById = async (userId) => {
    let userGroups;

    try {
        userGroups = await favouriteRepository.getAllGroupsOfUserById(userId);
    } catch (exception) {
        console.log(exception);
        throw exception
    }

    return userGroups;
}

module.exports.getAllGroupsOfFavouriteById = async (recipeId, userId) => {
    let userGroups;

    try {
        userGroups = await favouriteRepository.getAllGroupsOfFavouriteById(recipeId, userId);
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
        await favouriteRepository.addRecipeToGroup(data);
    } catch (exception) {
        console.log(exception);
        throw exception
    }
}

module.exports.deleteRecipeFromGroup = async (groupId, recipeId, userId) => {
    try {
        await favouriteRepository.deleteRecipeFromGroup(groupId, recipeId, userId);
    } catch (exception) {
        console.log(exception);
        throw exception
    }
}

module.exports.getAllRecipeCardsOfGroup = async (sortBy, groupId, page, userId) => {
    let recipeCards = [];

    try {
        recipeCards = await favouriteRepository.getAllRecipeCardsOfGroup(sortBy, groupId, page, userId);
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
        recipeCount = await favouriteRepository.getRecipeCountOfGroup(groupId, userId);
    } catch (exception) {
        console.log(exception);
        throw exception
    }

    return recipeCount;
}

module.exports.deleteRecipeFromGroups = async (recipeId, userGroups) => {
    try {
        let userGroupIds = [];

        for (let i = 0; i < userGroups.length; i++) {
            userGroupIds.push(userGroups[i].id)
        }

        await favouriteRepository.deleteRecipeFromGroups(recipeId, userGroupIds);
    } catch (exception) {
        console.log(exception);
        throw exception
    }
}