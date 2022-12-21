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
