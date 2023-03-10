const favouriteRepository = require('../repositories/favouriteRepository');
const BadRequest = require("../exceptions/BadRequest");

/**
 * Service function for adding recipe by recipeId to user's favourites.
 * @param recipeId recipeId of recipe to add
 * @param userId userId of user who added the favourite
 * @returns created favourite record as object
 */
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

/**
 * Service function for deleting recipe by recipeId from user's favourites.
 * @param recipeId recipeId of recipe to be deleted
 * @param userId userId of user to delete the recipe from
 */
module.exports.deleteById = async (recipeId, userId) => {
    try {
        await favouriteRepository.deleteById(recipeId, userId);
    } catch (exception) {
        console.log(exception);
        throw exception
    }
}

/**
 * Service function for getting all favourite recipeIds of user.
 * @param userId userId of user
 * @returns array of recipeIds
 */
module.exports.getAllUserFavourites = async (userId) => {
    let favourites = [];

    try {
        favourites = await favouriteRepository.getAllUserFavourites(userId);
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

/**
 * Service function for getting all favourite recipe cards of user, sorted, by page.
 * @param page page to get
 * @param sortBy sort cards by (options: nameAsc, nameDesc, uploadedAsc, uploadedDesc, addedToFavouritesAsc, addedToFavouritesDesc)
 * @param userId userId of user
 * @returns array of recipe card objects
 */
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

/**
 * Service function for getting the count of user's all favourites.
 * @param userId userId of user
 * @returns count of user's favourite recipes
 */
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

/**
 * Service function for creating a new group for a user. Validates the name of the group before creating it.
 * @param name name of new group
 * @param userId userId of user
 * @returns created new group record as object
 */
module.exports.createGroupForUser = async (name, userId) => {
    if(name.trim() === ""){
        throw new BadRequest(["Please provide a name for the group."]);
    }

    if(name.trim().length > 100){
        throw new BadRequest(["Group name can't be longer than 100 characters."]);
    }

    try {
        return await favouriteRepository.createGroupForUser(name, userId);
    } catch (exception) {
        console.log(exception);
        throw exception
    }
}

/**
 * Service function for editing group of user by groupId. Validates the new name of the group before updating it.
 * @param groupId groupId of group to be edited
 * @param newName new name of the group
 * @param userId userId of the group's user
 */
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

/**
 * Service function for deleting group of user by groupId.
 * @param groupId groupId of group to be deleted
 * @param userId userId of the group's user
 */
module.exports.deleteGroup = async (groupId, userId) => {
    try {
        await favouriteRepository.deleteGroup(groupId, userId);
    } catch (exception) {
        console.log(exception);
        throw exception
    }
}

/**
 * Service function for getting all groups of user.
 * @param userId userId of user
 * @returns array of user's groups as objects
 */
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

/**
 * Service function for getting all of a user's groups that a recipe is in by recipeId.
 * @param recipeId recipeId of recipe
 * @param userId userId of user
 * @returns array of groups as objects that the recipe is in
 */
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

/**
 * Service function for adding recipe to group by groupId and recipeId.
 * @param data object that contains the groupId and recipeId
 */
module.exports.addRecipeToGroup = async (data) => {
    try {
        await favouriteRepository.addRecipeToGroup(data);
    } catch (exception) {
        console.log(exception);
        throw exception
    }
}

/**
 * Service function for deleting recipe from group by groupId and recipeId.
 * @param groupId groupId of group to be deleted from
 * @param recipeId recipeId of recipe to be deleted from group
 * @param userId userId of the group's user
 */
module.exports.deleteRecipeFromGroup = async (groupId, recipeId, userId) => {
    try {
        await favouriteRepository.deleteRecipeFromGroup(groupId, recipeId, userId);
    } catch (exception) {
        console.log(exception);
        throw exception
    }
}

/**
 * Service function for getting all recipe cards of group by groupId, sorted, by page.
 * @param sortBy sort cards by (options: nameAsc, nameDesc, uploadedAsc, uploadedDesc, addedToGroupAsc, addedToGroupDesc)
 * @param groupId groupId of group
 * @param page page to get
 * @param userId userId of group's user
 * @returns array of group's recipe cards as objects
 */
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

/**
 * Service function for getting count of recipes in group by groupId.
 * @param groupId groupId of group
 * @param userId userId of group's user
 * @returns count of recipes in the group
 */
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

/**
 * Service function for deleting recipe by recipeId from current user's favourites. Deletes recipe from all given groups.
 * @param recipeId recipeId of recipe
 * @param userGroups array of groupIds of user's groups
 */
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