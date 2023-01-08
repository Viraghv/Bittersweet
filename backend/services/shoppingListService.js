const shoppingListRepository = require('../repositories/shoppingListRepository');

module.exports.getUserListById = async (userId) => {
    let shoppingList;

    try {
        shoppingList = await shoppingListRepository.getUserListById(userId);
    } catch (exception) {
        console.log(exception);
        throw exception
    }

    return shoppingList;
}

module.exports.addCategory = async (name, userId) => {
    let category;

    try {
        category = await shoppingListRepository.addCategory(name, userId);
    } catch (exception) {
        console.log(exception);
        throw exception
    }

    return category;
}

module.exports.addItems = async (categoryId, items) => {
    let addedItems;

    try {
        addedItems = await shoppingListRepository.addItems(categoryId, items);
    } catch (exception) {
        console.log(exception);
        throw exception
    }

    return addedItems;
}

module.exports.editCategoryById = async (categoryId, name, userId) => {
    try {
        await shoppingListRepository.editCategoryById(categoryId, name, userId);
    } catch (exception) {
        console.log(exception);
        throw exception
    }
}

module.exports.setItemDoneById = async (categoryId, done, userId) => {
    try {
        await shoppingListRepository.setItemDoneById(categoryId, done, userId);
    } catch (exception) {
        console.log(exception);
        throw exception
    }
}

module.exports.deleteCategoryById = async (categoryId, userId) => {
    try {
        await shoppingListRepository.deleteCategoryById(categoryId, userId);
    } catch (exception) {
        console.log(exception);
        throw exception
    }
}

module.exports.deleteAllDoneItemsOfUser = async (userId) => {
    try {
        await shoppingListRepository.deleteAllDoneItemsOfUser(userId);
    } catch (exception) {
        console.log(exception);
        throw exception
    }
}