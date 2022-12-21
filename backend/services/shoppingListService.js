const shoppingListRepository = require('../repositories/shoppingListRepository');

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