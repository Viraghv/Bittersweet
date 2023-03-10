const { PrismaClient } = require('@prisma/client')
const BadRequest = require("../exceptions/BadRequest");

const prisma = new PrismaClient();

/**
 * Repository function for getting user's shopping list.
 * Gets every shopping list category of user and the list items in each category.
 * @param userId userId of user
 * @returns object of user's every category ond the contained items in each one
 */
module.exports.getUserListById = async (userId) => {
    try {
        return await prisma.ShoppingListCategory.findMany({
            where: {
                userId: userId
            },

            select: {
                id: true,
                name: true,
                shoppingListItems: {
                    select: {
                        id: true,
                        name: true,
                        amount: true,
                        done: true,
                        unit: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

/**
 * Repository function for adding a new category to user's shopping list.
 * Inserts new category by the given name connected to the user into the ShoppingListCategory table.
 * @param name name of the new category
 * @param userId userId of user
 * @returns {Promise<*>} new category record as an object
 */
module.exports.addCategory = async (name, userId) => {
    try {
        return await prisma.ShoppingListCategory.create({
            data: {
                name: name,
                userId: userId,
            }
        });
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

/**
 * Repository function for adding new items to a category by categoryId on user's shopping list.
 * Inserts all items into the ShoppingListItem table, connected to the given category.
 * @param categoryId categoryId of category to add the items to
 * @param items array of objects containing the data of each item
 * @returns number of items added
 */
module.exports.addItemsToCategoryById = async (categoryId, items) => {
    // add categoryId to every item object for easier prisma create
    for (let i = 0; i < items.length; i++) {
        items[i].categoryId = categoryId;
    }

    try {
        return await prisma.ShoppingListItem.createMany({
            data: [
                ...items,
            ]
        });
    } catch (error) {
        console.log(error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

/**
 * Repository function for editing the name of a category by categoryId on user's shopping list.
 * Updates the name of the matching category in the ShoppingListCategory table.
 * @param categoryId categoryId of category to edit
 * @param name new name of category
 * @param userId userId of user
 */
module.exports.editCategoryById = async (categoryId, name, userId) => {
    try {
        let updatedCount = await prisma.ShoppingListCategory.updateMany({
            where: {
                id: categoryId,
                userId: userId,
            },
            data: {
                name: name,
            }
        });

        if(updatedCount.count === 0){
            throw new BadRequest(["No category updated. You may not be authorized to make this change."])
        }
    } catch (error) {
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

/**
 * Repository function for setting the 'done' attribute of an item on user's shopping list.
 * Updates 'done' attribute of matching item in the ShoppingListItem table.
 * @param itemId itemId of item
 * @param done value to set the 'done' attribute to (boolean)
 * @param userId userId of user (whose shopping list the item is on)
 */
module.exports.setItemDoneById = async (itemId, done, userId) => {
    try {
        await prisma.ShoppingListItem.updateMany({
            where: {
                id: itemId,
                shoppingListCategory: {
                    userId: userId,
                }
            },
            data: {
                done: done,
            }
        });
    } catch (error) {
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

/**
 * Repository function for deleting a category by categoryId on user's shopping list.
 * Deletes matching category from the ShoppingListCategory table.
 * @param categoryId categoryId of category to be deleted
 * @param userId userId of user (whose shopping list the category is on)
 */
module.exports.deleteCategoryById = async (categoryId, userId) => {
    try {
        let deletedCount = await prisma.ShoppingListCategory.deleteMany({
            where: {
                id: categoryId,
                userId: userId,
            },
        });

        if(deletedCount.count === 0){
            throw new BadRequest(["No category deleted. You may not be authorized to make this change."])
        }
    } catch (error) {
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

/**
 * Repository function for deleting all categories (and with that, all items too) from user's shopping list.
 * Deletes every category with a matching userId from the ShoppingListCategory table.
 * @param userId userId of user
 */
module.exports.deleteAllCategoriesOfUser = async (userId) => {
    try {
        await prisma.ShoppingListCategory.deleteMany({
            where: {
                userId: userId,
            },
        });
    } catch (error) {
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

/**
 * Repository function for deleting all items set as 'done' from user's shopping list.
 * Deletes every item from the ShoppingListItem table that's in one of the user's categories
 * and their 'done' attribute is set true.
 * @param userId userId of user
 */
module.exports.deleteAllDoneItemsOfUser = async (userId) => {
    try {
        await prisma.ShoppingListItem.deleteMany({
            where: {
                done: true,
                shoppingListCategory: {
                    userId: userId,
                }
            },
        });
    } catch (error) {
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}