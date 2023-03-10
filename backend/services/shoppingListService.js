const shoppingListRepository = require('../repositories/shoppingListRepository');

/**
 * Service function for getting user's shopping list.
 * @param userId userId of user
 * @returns object of user's every category ond the contained items in each one
 */
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

/**
 * Service function for adding a new category to user's shopping list.
 * @param name name of the new category
 * @param userId userId of user
 * @returns new category record as an object
 */
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

/**
 * Service function for adding new items to a category by categoryId on user's shopping list.
 * @param categoryId categoryId of category to add the items to
 * @param items array of objects containing the data of each item
 * @returns number of items added
 */
module.exports.addItemsToCategoryById = async (categoryId, items) => {
    let addedItemsCount;

    try {
        addedItemsCount = await shoppingListRepository.addItemsToCategoryById(categoryId, items);
    } catch (exception) {
        console.log(exception);
        throw exception
    }

    return addedItemsCount;
}

/**
 * Service function for editing the name of a category by categoryId on user's shopping list.
 * @param categoryId categoryId of category to edit
 * @param name new name of category
 * @param userId userId of user
 */
module.exports.editCategoryById = async (categoryId, name, userId) => {
    try {
        await shoppingListRepository.editCategoryById(categoryId, name, userId);
    } catch (exception) {
        console.log(exception);
        throw exception
    }
}

/**
 * Service function for setting the 'done' attribute of an item on user's shopping list.
 * @param itemId itemId of item
 * @param done value to set the 'done' attribute to (boolean)
 * @param userId userId of user (whose shopping list the item is on)
 */
module.exports.setItemDoneById = async (itemId, done, userId) => {
    try {
        await shoppingListRepository.setItemDoneById(itemId, done, userId);
    } catch (exception) {
        console.log(exception);
        throw exception
    }
}

/**
 * Service function for deleting a category by categoryId on user's shopping list.
 * @param categoryId categoryId of category to be deleted
 * @param userId userId of user (whose shopping list the category is on)
 */
module.exports.deleteCategoryById = async (categoryId, userId) => {
    try {
        await shoppingListRepository.deleteCategoryById(categoryId, userId);
    } catch (exception) {
        console.log(exception);
        throw exception
    }
}
/**
 * Service function for deleting all categories (and with that, all items too) from user's shopping list.
 * @param userId userId of user
 */
module.exports.deleteAllCategoriesOfUser = async (userId) => {
    try {
        await shoppingListRepository.deleteAllCategoriesOfUser(userId);
    } catch (exception) {
        console.log(exception);
        throw exception
    }
}

/**
 * Service function for deleting all items set as 'done' from user's shopping list.
 * @param userId userId of user
 */
module.exports.deleteAllDoneItemsOfUser = async (userId) => {
    try {
        await shoppingListRepository.deleteAllDoneItemsOfUser(userId);
    } catch (exception) {
        console.log(exception);
        throw exception
    }
}