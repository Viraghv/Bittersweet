const favouriteRepository = require('../repositories/favouriteRepository');

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